(function($) {
    "use strict";

    var DarkSlider = function(el, options)
    {
        this.$el = el;
        this.options = options;

        this.$elWrap = this.$el.find('.ds-el-wrap');
        this.$thumbWrap = this.$el.find('.ds-thumb-wrap');

        this.$activeEl = this.$elWrap.find('.ds-el').eq(0);
        this.$activeThumb = this.$thumbWrap.find('.ds-thumb').eq(0);

        this.ready = true;

        this.init();
        this.listen();
    }

    DarkSlider.prototype = {
        init: function() {
            var self = this;

            self.enableEl(self.$activeEl);
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
                $oldEl = self.$activeEl,
                $newEl = self.$el.find('#'+newId);

            if (self.ready === false || $oldEl.attr('id') === newId) return; // anti-spam

            self.ready = false;

            self.disableThumb(self.$activeThumb);
            self.enableThumb($thumb);

            self.disableEl(self.$activeEl);
            self.enableEl($newEl);

            // pourquoi le newlement ne fade pas In wtf is wrong with this shit?
            $newEl.fadeIn(300, function() {
                $oldEl.fadeOut(1);
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

        enableEl: function($el)
        {
            $el.addClass('active').css('z-index', 999);
            this.$activeEl = $el;
            return $el;
        },

        disableEl: function($el)
        {
            $el.removeClass('active').css('z-index', 9);
            return $el;
        }
    }

    $.fn.darkslider = function(options) {
        var darkslider = new DarkSlider(this, options);
    }

    $(window).on('load', function() {
        $('#slider').darkslider();
    });
})(jQuery);
