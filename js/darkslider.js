(function($) {
    "use strict";

    var DarkSlider = function(el, options)
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

    DarkSlider.prototype = {
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
            }, 5000)
        },

        listen: function()
        {
            var self = this;

            self.$el.find('.ds-thumb').on('click', function(e) {
                self.show($(this));
                e.preventDefault();
            });

            self.$el.on('mouseenter', function(e) {
                self.paused = true;
            });

            self.$el.on('mouseleave', function(e) {
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

    $.fn.darkslider = function(options) {
        var darkslider = new DarkSlider(this, options);
    };

    $(window).on('load', function() {
        $('#slider').darkslider();
    });
})(jQuery);

(function($) {
    "use strict";

    var DarkCarousel = function(el, options)
    {
        this.$el = el;
        this.options = options;



        this.ready = true;
        this.paused = false;

        this.init();
        this.listen();
    };

    DarkCarousel.prototype = {
        init: function() {
            var self = this;


        },

        listen: function()
        {
            var self = this;


        },

        slide: function(direction)
        {
            var self = this,
                $first = self.$thumbsWrap.find('li').first(),
                $last = self.$thumbsWrap.find('li').last();

            if (self.carouselRdy === false) return; // anti button spamming

            self.carouselRdy = false;
            self.carouselRunning = true;

            if (direction === 'next') {
                self.$thumbsWrap.animate({'left': '-'+self.imgWidth}, function() {
                    var $thumb = self.$current.parent().next().children();
                    $first.insertAfter($last);
                    self.slideCallback($thumb);
                });
            } else {
                self.$thumbsWrap.animate({'left': '+'+self.imgWidth}, function() {
                    $last.insertBefore($first);
                    var $thumb = self.$current.parent().prev().children();
                    self.slideCallback($thumb);
                });
            }
        }
    };

    $.fn.darkcarousel = function(options) {
        var darkcarousel = new DarkCarousel(this, options);
    };

    $(window).on('load', function() {
        $('#carousel').darkcarousel();
    });
})(jQuery);
