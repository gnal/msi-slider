// Slider

(function($) {
    "use strict";

    var Slider = function(el, options)
    {
        this.$el = el;
        this.options = options;

        this.$stuffWrap = this.$el.find('.ds-stuff-wrap');
        this.$thumbWrap = this.$el.find('.ds-thumb-wrap');

        this.$activeStuff = this.$stuffWrap.find('.ds-stuff').eq(0);
        this.$activeThumb = this.$thumbWrap.find('.ds-thumb').eq(0);

        this.ready = true;
        this.paused = false;

        this.init();
        this.listen();
    };

    Slider.prototype = {
        init: function() {
            var self = this;

            self.enableStuff(self.$activeStuff);
            self.enableThumb(self.$activeThumb);

            setInterval(function() {
                if (!self.paused) {
                    if (self.$activeThumb.next().length > 0) {
                        self.show(self.$activeThumb.next());
                    } else {
                        self.show(self.$thumbWrap.find('.ds-thumb').eq(0));
                    }
                }
            }, 5000);
        },

        listen: function()
        {
            var self = this;

            self.$el.find('.ds-thumb').on('click', function(e) {
                self.show($(this));
                e.preventDefault();
            });

            self.$el.on('mouseenter', function() {
                self.paused = true;
            });

            self.$el.on('mouseleave', function() {
                self.paused = false;
            });
        },

        show: function($thumb)
        {
            var self = this,
                newId = 'photo'+$thumb.data('id'),
                $oldStuff = self.$activeStuff,
                $newStuff = self.$el.find('#'+newId);

            if (self.ready === false || $oldStuff.attr('id') === newId) {
                return;
            }

            self.ready = false;

            self.disableThumb(self.$activeThumb);
            self.enableThumb($thumb);

            self.disableStuff(self.$activeStuff);
            self.enableStuff($newStuff);

            $newStuff.fadeIn(200, function() {
                $oldStuff.fadeOut(1);
                $oldStuff.find('.text-container').fadeOut(1);

                $newStuff.find('.text-container').effect('slide', {mode: 'show', easing: 'easeOutBounce'}, 1500);

                self.ready = true;
            });
        },

        enableThumb: function($thumb)
        {
            $thumb.addClass('active');
            this.$activeThumb = $thumb;

            return $thumb;
        },

        disableThumb: function($thumb)
        {
            $thumb.removeClass('active');

            return $thumb;
        },

        enableStuff: function($stuff)
        {
            $stuff.addClass('active').css('z-index', 999);
            this.$activeStuff = $stuff;

            return $stuff;
        },

        disableStuff: function($stuff)
        {
            $stuff.removeClass('active').css('z-index', 9);

            return $stuff;
        }
    };

    $.fn.slider = function(options) {
        var slider = new Slider(this, options);
    };
})(jQuery);

// Carousel

(function($, window, undefined) {
    "use strict";

    var Carousel = {
        init: function(el, options) {
            var self = this;

            self.$el = $(el);
            self.options = $.extend({}, $.fn.msicarousel.options, options);

            self.$ul = self.$el.find('ul');
            self.ulChildrenLength = self.$ul.children('li').length;

            self.ready = true;
            self.i = 1;
            self.position = self.options.axis === 'x' ? 'left' : 'top';
            self.slideFunc = self.options.infinite === false ? self.slide : self.slideInfinitely;

            if (self.options.axis === 'x') {
                self.liDimension = self.$ul.children('li').first().outerWidth(true);
                self.wrapDimension = self.$ul.closest('div').width();
            } else {
                self.liDimension = self.$ul.children('li').first().outerHeight(true);
                self.wrapDimension = self.$ul.closest('div').height();
            }

            self.visibleLiLength = Math.ceil(self.wrapDimension / self.liDimension);
            self.canSlide = self.ulChildrenLength <= self.visibleLiLength ? false : true;

            // set ul dimension
            self.$ul.css(self.options.axis === 'x' ? 'width' : 'height', self.liDimension * self.ulChildrenLength);

            // set starting position of first slide
            if (self.options.infinite && self.visibleLiLength < self.ulChildrenLength) {
                self.$ul.css(self.position, -self.liDimension);
                // put last li in first so we see the first li and not the second, at begining
                self.$ul.children('li').last().insertBefore(self.$ul.children('li').first());
            }

            self.listen();

            if (this.options.cycle === true) {
                self.cycle();
            }
        },

        listen: function()
        {
            var self = this;

            self.$el.on('click', '.move', function(e) {
                var direction = $(this).hasClass('move-next') ? 'next' : 'prev';
                self.slideFunc(direction);
                e.preventDefault();
            });

            if (self.options.pauseOnHover === true) {
                self.$el.on('mouseenter', function() {
                    self.pause();
                });
                self.$el.on('mouseleave', function() {
                    self.cycle();
                });
            }
        },

        pause: function() {
            clearInterval(this.interval);
            this.interval = null;
        },

        cycle: function() {
            this.interval = setInterval($.proxy(this.slideFunc, this), this.options.pauseTime);
        },

        slide: function(direction)
        {
            if (this.canSlide === false || this.ready === false) {
                return;
            }
            // not ready
            this.ready = false;

            var self = this,
                properties = {};

            self.l = self.ulChildrenLength - self.visibleLiLength + 1;
            if (self.l < 1) self.l = 1;

            direction = typeof direction !== 'undefined' ? direction : 'next';

            if (direction === 'next') {
                if (self.i === self.l) {
                    properties[self.position] = 0;
                    self.i = 1;
                } else {
                    properties[self.position] = '-'+self.liDimension * self.i;
                    self.i++;
                }
            } else {
                if (self.i === 1) {
                    self.i = self.l;
                    properties[self.position] = '-'+self.liDimension * (self.l - 1);
                } else {
                    self.i--;
                    properties[self.position] = '-'+self.liDimension * (self.i - 1);
                }
            }

            self.$ul.animate(properties, function() {
                // ready
                self.ready = true;
                // callback
                if (direction === 'next' && typeof self.options.afterNext === 'function') {
                    self.options.afterNext();
                }
                // callback
                if (direction === 'prev' && typeof self.options.afterPrev === 'function') {
                    self.options.afterPrev();
                }
            });
        },

        slideInfinitely: function(direction)
        {
            if (this.canSlide === false || this.ready === false) {
                return;
            }
            // not ready
            this.ready = false;

            var self = this,
                $first = self.$ul.children('li').first(),
                $last = self.$ul.children('li').last(),
                properties = {};

            direction = typeof direction !== 'undefined' ? direction : 'next';

            if (direction === 'next') {
                properties[self.position] = '-'+self.liDimension * 2;
                self.$ul.animate(properties, function() {
                    $first.insertAfter($last);
                    // reposition the ul so it doesn't move when we insert the li
                    self.$ul.css(self.position, -self.liDimension);
                    // ready
                    self.ready = true;
                    // callback
                    if (typeof self.options.afterNext === 'function') {
                        self.options.afterNext();
                    }
                });
            } else {
                properties[self.position] = 0;
                self.$ul.animate(properties, function() {
                    $last.insertBefore($first);
                    // reposition the ul so it doesn't move when we insert the li
                    self.$ul.css(self.position, -self.liDimension);
                    // ready
                    self.ready = true;
                    // callback
                    if (typeof self.options.afterPrev === 'function') {
                        self.options.afterPrev();
                    }
                });
            }
        }
    };

    $.fn.msicarousel = function(options) {
        return this.each(function() {
            var carousel = Object.create(Carousel);
            carousel.init(this, options);
        });
    };

    $.fn.msicarousel.options = {
        infinite: false,
        pauseTime: 3000,
        pauseOnHover: true,
        axis: 'x',
        cycle: false,
        afterNext: function() {},
        afterPrev: function() {}
    };
})(jQuery, window);
