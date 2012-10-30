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

        this.init();
        this.listen();
    };

    DarkSlider.prototype = {
        init: function() {
            var self = this;

            self.enableStuff(self.$activeStuff);
            self.enableThumb(self.$activeThumb);
        },

        listen: function()
        {
            var self = this;

            self.$el.find('.ds-thumb').on('click', function(e) {
                self.show($(this));
                e.preventDefault();
            });
        },

        show: function($thumb)
        {
            var self = this,
                newId = 'photo'+$thumb.data('id'),
                $oldStuff = self.$activeStuff,
                $newStuff = self.$el.find('#'+newId);

            if (self.ready === false || $oldStuff.attr('id') === newId) return; // anti-spam

            self.ready = false;

            self.disableThumb(self.$activeThumb);
            self.enableThumb($thumb);

            self.disableStuff(self.$activeStuff);
            self.enableStuff($newStuff);

            // pourquoi le newlement ne fade pas In wtf is wrong with this shit?
            $newStuff.fadeIn(300, function() {
                $oldStuff.fadeOut(1);
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
