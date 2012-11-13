if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {};
        F.prototype = obj;
        return new F();
    };
}

(function($, window, undefined) {
    "use strict";

    var MsiSlider = {
        init: function(el, options) {
            var self = this;

            self.$el = $(el);
            self.options = $.extend({}, $.fn.msiSlider.options, options);

            self.$ul = self.$el.find('ul.carousel');
            self.$activeCarouselLi = self.$ul.children('li').first();

            self.ulChildrenLength = self.$ul.children('li').length;
            self.carouselReady = true;
            self.sliderReady = true;
            self.clicked = false;
            self.interval = 0;
            self.i = 1;
            self.position = self.options.axis === 'x' ? 'left' : 'top';
            self.slideFunc = !self.options.infinite ? self.slide : self.slideInfinitely;

            if (self.options.axis === 'x') {
                self.liDimension = self.$ul.children('li').first().outerWidth(true);
                self.wrapDimension = self.$ul.closest('div').width();
            } else {
                self.liDimension = self.$ul.children('li').first().outerHeight(true);
                self.wrapDimension = self.$ul.closest('div').height();
            }

            self.visibleLiLength = Math.ceil(self.wrapDimension / self.liDimension);
            self.carouselCanSlide = self.ulChildrenLength <= self.visibleLiLength ? false : true;
            self.sliderCanSlide = self.ulChildrenLength > 1 ? true : false;

            // set ul dimension
            self.$ul.css(self.options.axis === 'x' ? 'width' : 'height', self.liDimension * self.ulChildrenLength);

            // set starting position of first slide
            if (self.options.infinite && self.visibleLiLength < self.ulChildrenLength) {
                self.$ul.css(self.position, -self.liDimension);
                // put last li in first so we see the first li and not the second, at begining
                self.$ul.children('li').last().insertBefore(self.$ul.children('li').first());
            }

            self.listen();

            self.options.cycle && self.cycle();

            if (self.options.debug) {
                self.debug();
            }
        },

        listen: function()
        {
            var self = this;

            if (self.carouselCanSlide) {
                self.$el.on('click', 'a.control', function(e) {
                    self.slideFunc($(this).data('direction') === 'next' ? 'next' : 'prev');
                    e.preventDefault();
                });
            }

            if (self.options.slider) {
                self.$el.on('click', 'ul.carousel li', function(e) {
                    self.clicked = true;
                    self.pause();
                    self.show($(this));
                    e.preventDefault();
                });
            }

            if (self.options.cycle && self.options.pauseOnHover) {
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
        },

        cycle: function() {
            var self = this;

            if (self.clicked) {
                return;
            }

            if (self.carouselCanSlide) {
                self.interval = setInterval($.proxy(self.slideFunc, self), self.options.speed);
                return;
            }

            if (self.sliderCanSlide) {
                self.interval = setInterval(function() {
                    self.show(self.$activeCarouselLi.next().length ? self.$activeCarouselLi.next() : self.$ul.children('li').first());
                }, self.options.speed);
                return;
            }
        },

        slide: function(direction)
        {
            var self = this,
                properties = {};

            if (!self.carouselCanSlide) {
                return;
            }

            if (!self.carouselReady) {
                return;
            }

            self.carouselReady = false;

            self.l = self.ulChildrenLength - self.visibleLiLength + 1;
            if (self.l < 1) { self.l = 1; }

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
                self.carouselReady = true;
                // callback
                if (direction === 'next' && typeof self.options.afterCarouselNext === 'function') {
                    self.options.afterCarouselNext();
                }
                // callback
                if (direction === 'prev' && typeof self.options.afterCarouselPrev === 'function') {
                    self.options.afterCarouselPrev();
                }
            });
        },

        slideInfinitely: function(direction)
        {
            var self = this,
                $first = self.$ul.children('li').first(),
                $last = self.$ul.children('li').last(),
                properties = {};

            if (!self.carouselCanSlide) {
                return;
            }

            if (!self.carouselReady) {
                return;
            }

            self.carouselReady = false;

            direction = typeof direction !== 'undefined' ? direction : 'next';

            if (direction === 'next') {
                properties[self.position] = '-'+self.liDimension * 2;

                self.$ul.animate(properties, function() {
                    $first.insertAfter($last);
                    // reposition the ul
                    self.$ul.css(self.position, -self.liDimension);
                    // callback
                    if (typeof self.options.afterCarouselNext === 'function') {
                        self.options.afterCarouselNext();
                    }
                    if (self.options.slider) {
                        self.show(self.$activeCarouselLi.next().length ? self.$activeCarouselLi.next() : self.$ul.children('li').first());
                    } else {
                        self.carouselReady = true;
                    }
                });
            } else {
                properties[self.position] = 0;
                self.$ul.animate(properties, function() {
                    $last.insertBefore($first);
                    // reposition the ul
                    self.$ul.css(self.position, -self.liDimension);
                    // callback
                    if (typeof self.options.afterCarouselPrev === 'function') {
                        self.options.afterCarouselPrev();
                    }
                    if (self.options.slider) {
                        // cannot call method prev of undefined
                        self.show(self.$activeCarouselLi.prev().length ? self.$activeCarouselLi.prev() : self.$ul.children('li').last());
                    } else {
                        self.carouselReady = true;
                    }
                });
            }
        },

        show: function($li)
        {
            var self = this,
                newId = 'li'+$li.data('id'),
                $oldSliderLi = self.$el.find('ul.slider > li.active'),
                $newSliderLi = self.$el.find('#'+newId),
                $newSliderOverlay = $newSliderLi.find('.overlay'),
                $oldSliderOverlay = $oldSliderLi.find('.overlay');

            if ($oldSliderLi.attr('id') === newId) {
                return;
            }
            if (!self.sliderReady) {
                return;
            }
            if (!self.options.slider) {
                return;
            }
            self.sliderReady = false;
            self.carouselReady = false;

            $oldSliderLi.css('z-index', 998).removeClass('active');
            $newSliderLi.css('z-index', 999).addClass('active');
            $li.addClass('active');
            self.$activeCarouselLi.removeClass('active');

            self.$activeCarouselLi = $li;

            $newSliderLi.effect(self.options.sliderFx, self.options.sliderFxArgs, self.options.sliderFxSpeed, function() {
                $oldSliderLi.hide();
                $oldSliderOverlay.hide();

                if ($newSliderOverlay.length) {
                    $newSliderOverlay.effect(self.options.overlayFx, self.options.overlayFxArgs, self.options.overlayFxSpeed, function() {
                        self.sliderReady = true;
                        self.carouselReady = true;
                    });
                } else {
                    self.sliderReady = true;
                    self.carouselReady = true;
                }
            });
        },

        debug: function() {
            console.log('element: '+this.$el.attr('id'));
            console.log('carouselCanSlide: '+this.carouselCanSlide);
            console.log('wrap dimension: '+this.wrapDimension+'px');
            console.log('li dimension: '+this.liDimension+'px');
            console.log('number of li: '+this.ulChildrenLength);
            console.log('number of visible li: '+this.visibleLiLength);
        }
    };

    $.fn.msiSlider = function(options) {
        return this.each(function() {
            var msiSlider = Object.create(MsiSlider);
            msiSlider.init(this, options);
        });
    };

    $.fn.msiSlider.options = {
        infinite: false,
        speed: 3000,
        pauseOnHover: true,
        debug: false,
        axis: 'x',
        slider: false,
        cycle: false,
        sliderFx: 'fade',
        sliderFxArgs: {mode: 'show', easing: 'swing'},
        sliderFxSpeed: 300,
        overlayFx: 'slide',
        overlayFxArgs: {direction: 'left', mode: 'show', easing: 'swing'},
        overlayFxSpeed: 800,
        afterCarouselNext: function() {},
        afterCarouselPrev: function() {},
        afterSliderNext: function() {},
        afterSliderPrev: function() {}
    };
})(jQuery, window);
