if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {}
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

            self.$cUl = self.$el.find('ul.carousel');
            self.$sUl = self.$el.find('ul.slider');

            self.$cLiActive = self.$cUl
                .children('li')
                .first()
                .addClass('active');

            self.$sUl
                .children('li')
                .first()
                .addClass('active')
                .css('z-index', 999);

            $.each(self.$sUl.children('li'), function(i, e) {
                var $e = $(e);
                $e.attr('data-id', i);
                if (i !== 0) {
                    $e.css('z-index', 998).hide();
                }
            });

            $.each(self.$cUl.children('li'), function(i, e) {
                var $e = $(e);
                $e.attr('data-id', i);
            });

            self.ulChildrenLength = self.$cUl.children('li').length;
            self.carouselReady = true;
            self.sliderReady = true;
            self.clicked = false;
            self.interval = 0;
            self.i = 1;
            self.position = self.options.axis === 'x' ? 'left' : 'top';
            self.slideFunc = !self.options.infinite ? self.slide : self.slideInfinitely;

            if (self.options.axis === 'x') {
                self.liDimension = self.$cUl.children('li').first().outerWidth(true);
                self.wrapDimension = self.$cUl.closest('div').width();
            } else {
                self.liDimension = self.$cUl.children('li').first().outerHeight(true);
                self.wrapDimension = self.$cUl.closest('div').height();
            }

            self.visibleLiLength = Math.ceil(self.wrapDimension / self.liDimension);
            self.carouselCanSlide = self.ulChildrenLength <= self.visibleLiLength ? false : true;
            self.sliderCanSlide = self.ulChildrenLength > 1 ? true : false;

            // set ul dimension
            self.$cUl.css(self.options.axis === 'x' ? 'width' : 'height', self.liDimension * self.ulChildrenLength);

            // set starting position of first slide
            if (self.options.infinite && self.visibleLiLength < self.ulChildrenLength) {
                self.$cUl.css(self.position, -self.liDimension);
                // put last li in first so we see the first li and not the second, at begining
                self.$cUl.children('li').last().insertBefore(self.$cUl.children('li').first());
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
                    e.preventDefault();
                    if (self.sliderReady && self.carouselReady) {
                        self.slideFunc($(this).data('direction') === 'next' ? 'next' : 'prev');
                    }
                });
            }

            if (self.options.slider) {
                self.$el.on('click', 'ul.carousel li', function(e) {
                    e.preventDefault();
                    if (self.sliderReady && self.carouselReady) {
                        self.clicked = true;
                        self.pause();
                        self.show($(this));
                    }
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
                self.interval = setInterval(function() {
                    self.sliderReady && self.carouselReady && self.slideFunc();
                }, self.options.pauseTime);
                return;
            }

            if (self.sliderCanSlide) {
                self.interval = setInterval(function() {
                    var $cLi = self.$cLiActive.next().length ? self.$cLiActive.next() : self.$cUl.children('li').first();
                    self.sliderReady && self.carouselReady && self.show($cLi);
                }, self.options.pauseTime);
                return;
            }
        },

        slide: function(direction)
        {
            var self = this,
                properties = {};

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

            self.$cUl.animate(properties, function() {
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
                $first = self.$cUl.children('li').first(),
                $last = self.$cUl.children('li').last(),
                properties = {};

            self.carouselReady = false;

            direction = typeof direction !== 'undefined' ? direction : 'next';

            if (direction === 'next') {
                properties[self.position] = '-'+self.liDimension * 2;

                self.$cUl.animate(properties, self.options.carouselSpeed, function() {
                    $first.insertAfter($last);
                    // reposition the ul
                    self.$cUl.css(self.position, -self.liDimension);
                    // callback
                    if (typeof self.options.afterCarouselNext === 'function') {
                        self.options.afterCarouselNext();
                    }
                    if (self.options.slider) {
                        self.show(self.$cLiActive.next().length ? self.$cLiActive.next() : self.$cUl.children('li').first());
                    } else {
                        self.carouselReady = true;
                    }
                });
            } else {
                properties[self.position] = 0;
                self.$cUl.animate(properties, self.options.carouselSpeed, function() {
                    $last.insertBefore($first);
                    // reposition the ul
                    self.$cUl.css(self.position, -self.liDimension);
                    // callback
                    if (typeof self.options.afterCarouselPrev === 'function') {
                        self.options.afterCarouselPrev();
                    }
                    if (self.options.slider) {
                        // cannot call method prev of undefined
                        self.show(self.$cLiActive.prev().length ? self.$cLiActive.prev() : self.$cUl.children('li').last());
                    } else {
                        self.carouselReady = true;
                    }
                });
            }
        },

        show: function($cLiNew)
        {
            var self = this,
                newId = $cLiNew.data('id'),
                $sLiOld = self.$sUl.children('li.active'),
                $sLiNew = self.$sUl.children('li[data-id='+newId+']'),
                $sOverlayOld = $sLiOld.find('.overlay'),
                $sOverlayNew = $sLiNew.find('.overlay');

            if ($sLiOld.data('id') === newId) {
                return;
            }

            self.sliderReady = false;

            $sLiOld.css('z-index', 998).removeClass('active');
            $sLiNew.css('z-index', 999).addClass('active');
            $cLiNew.addClass('active');
            self.$cLiActive.removeClass('active');
            self.$cLiActive = $cLiNew;

            $sLiNew.effect(self.options.sliderEffect, self.options.sliderArgs, self.options.sliderSpeed, function() {
                $sLiOld.hide();
                $sOverlayOld.hide();

                if ($sOverlayNew.length) {
                    $sOverlayNew.effect(self.options.overlayEffect, self.options.overlayArgs, self.options.overlaySpeed, function() {
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
        slider: true,
        infinite: true,
        cycle: true,
        pauseTime: 3000,
        pauseOnHover: true,
        debug: false,
        axis: 'x',
        carouselSpeed: 400,
        sliderEffect: 'fade',
        sliderArgs: {mode: 'show', easing: 'swing'},
        sliderSpeed: 300,
        overlayEffect: 'slide',
        overlayArgs: {direction: 'left', mode: 'show', easing: 'swing'},
        overlaySpeed: 800,
        afterCarouselNext: function() {},
        afterCarouselPrev: function() {},
        afterSliderNext: function() {},
        afterSliderPrev: function() {}
    };
})(jQuery, window);
