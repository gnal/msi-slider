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

    $.fn.slider = function(options) {
        var slider = new Slider(this, options);
    };

    $(window).on('load', function() {
        $('#slider').slider();
    });
})(jQuery);

// Carousel

(function($) {
    "use strict";

    var MsiCarousel = function(el, options)
    {
        this.$el = el;
        this.options = options;

        this.$ul = this.$el.find('ul');

        this.$li = this.$ul.children('li').first();
        this.liWidth = this.$li.width() + this.$li.outerWidth(true) - this.$li.innerWidth();

        this.ready = true;
        this.paused = false;

        this.init();
        this.listen();
    };

    MsiCarousel.prototype = {
        init: function() {
            var self = this;

            self.$ul.css('width', this.liWidth * self.$ul.children('li').length);

            setInterval(function() {
                if (!self.paused) {
                    self.slide();
                }
            }, 5000)
        },

        listen: function()
        {
            var self = this;

            self.$el.on('click', '.control', function(e) {
                self.slide($(this));
                e.preventDefault();
            });

            self.$el.on('mouseenter', function(e) {
                self.paused = true;
            });

            self.$el.on('mouseleave', function(e) {
                self.paused = false;
            });
        },

        slide: function($control)
        {
            var self = this,
                $first = self.$ul.children('li').first(),
                $last = self.$ul.children('li').last();

            if (self.ready === false) {
                return;
            }

            self.ready = false;

            if ('undefined' === typeof $control || $control.hasClass('control-next')) {
                self.$ul.animate({'left': '-'+self.liWidth * 2}, function() {
                    $first.insertAfter($last);
                    self.$ul.css('left', -self.liWidth);
                    self.ready = true;
                });
            } else {
                self.$ul.animate({'left': 0}, function() {
                    $last.insertBefore($first);
                    self.$ul.css('left', -self.liWidth);
                    self.ready = true;
                });
            }
        }
    };

    $.fn.msicarousel = function(options) {
        $.each(this, function(i, e) {
            var msicarousel = new MsiCarousel($(e), options);
        });
    };

    $(window).on('load', function() {
        $('.msicarousel').msicarousel();
    });
})(jQuery);
