// Carouslider

(function($, window, undefined) {
    "use strict";

    var Carousel = {
        init: function(el, options) {
            var self = this;

            self.$el = $(el);
            self.options = $.extend({}, $.fn.msicarousel.options, options);

            self.$ul = self.$el.find('ul.carousel');
            self.$currentCarouselLi = self.$ul.children('li').first();

            self.ulChildrenLength = self.$ul.children('li').length;
            self.carouselReady = true;
            self.sliderReady = true;
            self.clicked = false;
            self.interval = 0;
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
            self.cycle();

            if (this.options.debug === true) {
                self.debug();
            }
        },

        listen: function()
        {
            var self = this;

            self.$el.on('click', 'a.control', function(e) {
                self.slideFunc($(this).data('direction') === 'next' ? 'next' : 'prev');
                e.preventDefault();
            });

            if (self.options.slider === true) {
                self.$el.on('click', 'ul.carousel li', function(e) {
                    self.clicked = true;
                    self.pause();
                    self.show($(this));
                    e.preventDefault();
                });
            }

            if (self.options.pauseOnHover === true && self.options.cycle === true) {
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
            if (this.clicked === true) {
                return;
            }
            if (this.options.cycle === false) {
                return;
            }

            var self = this;

            if (this.canSlide === true) {
                this.interval = setInterval($.proxy(this.slideFunc, this), this.options.pauseTime);
            } else {
                this.interval = setInterval(function() {
                    self.show(self.$currentCarouselLi.next().length ? self.$currentCarouselLi.next() : self.$ul.children('li').first());
                }, this.options.pauseTime);
            }
        },

        slide: function(direction)
        {
            if (this.canSlide === false) {
                return;
            }
            if (this.carouselReady === false) {
                return;
            }
            this.carouselReady = false;

            var self = this,
                properties = {};

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
            if (this.canSlide === false) {
                return;
            }
            if (this.carouselReady === false) {
                return;
            }
            this.carouselReady = false;

            var self = this,
                $first = self.$ul.children('li').first(),
                $last = self.$ul.children('li').last(),
                properties = {};

            direction = typeof direction !== 'undefined' ? direction : 'next';

            if (direction === 'next') {
                properties[self.position] = '-'+self.liDimension * 2;

                self.$ul.animate(properties, function() {
                    $first.insertAfter($last);
                    // reposition the ul
                    self.$ul.css(self.position, -self.liDimension);
                    // callback
                    if (typeof self.options.afterNext === 'function') {
                        self.options.afterNext();
                    }
                    if (self.options.slider === true) {
                        self.show(self.$currentCarouselLi.next().length ? self.$currentCarouselLi.next() : self.$ul.children('li').first());
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
                    if (typeof self.options.afterPrev === 'function') {
                        self.options.afterPrev();
                    }
                    if (self.options.slider === true) {
                        self.show(self.$currentCarouselLi.prev().length ? self.$activeLi.prev() : self.$ul.children('li').last());
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
            if (this.carouselReady === false) {
                return;
            }
            if (this.sliderReady === false) {
                return;
            }
            if (this.options.slider === false) {
                return;
            }
            this.sliderReady = false;
            this.carouselReady = false;

            $oldSliderLi.css('z-index', 998).removeClass('active');
            $newSliderLi.css('z-index', 999).addClass('active');
            $li.addClass('active');
            self.$currentCarouselLi.removeClass('active');

            self.$currentCarouselLi = $li;

            $newSliderLi.fadeIn(300, function() {
                $oldSliderLi.hide();
                $oldSliderOverlay.hide();

                if ($newSliderOverlay.length) {
                    $newSliderOverlay.effect('slide', {direction: 'left', mode: 'show', easing: 'swing'}, 800, function() {
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
            console.log('canSlide: '+this.canSlide);
            console.log('wrap dimension: '+this.wrapDimension+'px');
            console.log('li dimension: '+this.liDimension+'px');
            console.log('number of li: '+this.ulChildrenLength);
            console.log('number of visible li: '+this.visibleLiLength);
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
        debug: false,
        axis: 'x',
        cycle: false,
        slider: false,
        afterNext: function() {},
        afterPrev: function() {}
    };
})(jQuery, window);
