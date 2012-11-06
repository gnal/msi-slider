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

(function($, window, document) {
    "use strict";

    var Carousel = {
        init: function(el, options) {
            var self = this;

            self.$el = $(el);
            self.options = $.extend({}, $.fn.msicarousel.options, options);

            self.$ul = self.$el.find('ul');
            self.ulChildrenLength = self.$ul.children('li').length;

            self.ready = true;
            self.paused = false;
            self.i = 1;
            self.position = self.options.axis === 'x' ? 'left' : 'top';

            // if horizontal
            if (self.options.axis === 'x') {
                // calculate dimension of a li
                self.liDimension = self.$ul.children('li').first().outerWidth(true);
                // set correct dimension for the ul
                self.$ul.css('width', self.liDimension * self.ulChildrenLength);
                // set starting position
                if (self.options.infinite) {
                    self.$ul.css(self.position, -self.liDimension);
                }
            // if vertical
            } else {
                // calculate dimension of a li
                self.liDimension = self.$ul.children('li').first().outerHeight(true);
                // set correct dimension for the ul
                self.$ul.css('height', self.liDimension * self.ulChildrenLength);
                // set starting position
                if (self.options.infinite) {
                    self.$ul.css(self.position, -self.liDimension);
                }
            }

            self.l = self.ulChildrenLength - Math.round(self.$el.width() / self.liDimension) + 1;

            if (self.options.manualAdvance === false) {
                setInterval(function() {
                    if (!self.options.pauseOnHover || !self.paused) {
                        self.slide('next');
                    }
                }, self.options.pauseTime);
            }

            self.listen();
        },

        listen: function()
        {
            var self = this;

            self.$el.on('click', '.control', function(e) {
                var direction = $(this).hasClass('control-next') ? 'next' : 'prev';
                if (self.options.infinite === false) {
                    self.slide(direction);
                } else {
                    self.slideInfinitely(direction);
                }
                e.preventDefault();
            });

            self.$el.on('mouseenter', function() {
                self.paused = true;
            });

            self.$el.on('mouseleave', function() {
                self.paused = false;
            });
        },

        slide: function(direction)
        {
            if (this.ready === false) {
                return;
            }
            // not ready
            this.ready = false;

            var self = this,
                properties = {};

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
            if (this.ready === false) {
                return;
            }
            // not ready
            this.ready = false;

            var self = this,
                $first = self.$ul.children('li').first(),
                $last = self.$ul.children('li').last(),
                properties = {};

            if (direction === 'next') {
                properties[self.position] = '-'+self.liDimension * 2;
                self.$ul.animate(properties, function() {
                    $first.insertAfter($last);
                    // reposition the ul so it doesn't move when we insert the li
                    self.$ul.css(self.position, -self.liDimension);
                    // ready
                    self.ready = true;
                    // callback
                    if (direction === 'next' && typeof self.options.afterNext === 'function') {
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
                    if (direction === 'prev' && typeof self.options.afterPrev === 'function') {
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
        manualAdvance: false,
        afterNext: function() {},
        afterPrev: function() {}
    };
})(jQuery, window, document);
