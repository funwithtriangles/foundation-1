/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.dropdown = {
    name : 'dropdown',

    version : '4.3.0',

    settings : {
      activeClass: 'open',
      is_hover: false,
      opened: function(){},
      closed: function(){}
    },

    init : function (scope, method, options) {
      this.scope = scope || this.scope;
      Foundation.inherit(this, 'throttle scrollLeft data_options');

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      if (typeof method !== 'string') {

        if (!this.settings.init) {
          this.events();
        }

        return this.settings.init;
      } else {
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;

      $(this.scope)
        .on('click.fndtn.dropdown', '[data-dropdown]', function (e) {
          var settings = $.extend({}, self.settings, self.data_options($(this)));
          e.preventDefault();

          if (!settings.is_hover) self.toggle($(this));
        })
        .on('mouseenter', '[data-dropdown]', function (e) {

          var $this = $(this);
          var $target = $('#'+$this.data('dropdown'));

          // For hover mode, clears timer that would otherwise close the dropdown
          clearTimeout($target.data('timeoutId'));

          var settings = $.extend({}, self.settings, self.data_options($(this)));

          self.close.call(self, $('[data-dropdown-content]')); //Close any other currently open dropdowns
          if (settings.is_hover) self.open.call(self, $target, $this);
        })
        .on('mouseleave', '[data-dropdown]', function (e) {

          var $this = $(this);
          var $target = $('#'+$this.data('dropdown'));

          //Timer set to close dropdown unless cancelled
          var timeoutId = setTimeout(function() {
            var settings = $.extend({}, self.settings, self.data_options($this));
            if (settings.is_hover) self.close.call(self, $target, $this);
          }, 100);

          $('#'+$this.data('dropdown')).data('timeoutId', timeoutId);
         
        })
        .on('mouseenter', '[data-dropdown-content]', function (e) {

          // For hover mode, clears timer that would otherwise close the dropdown
          clearTimeout($(this).data('timeoutId'));
         
        })
        .on('mouseleave', '[data-dropdown-content]', function (e) {

          var $this = $(this);

          //Timer set to close dropdown unless cancelled
          var timeoutId = setTimeout(function() {
            var target = $('[data-dropdown="' + $this.attr('id') + '"]'),
                settings = $.extend({}, self.settings, self.data_options(target));
            if (settings.is_hover) self.close.call(self, $this);
          }, 100);

          $this.data('timeoutId', timeoutId);

        })
        .on('opened.fndtn.dropdown', '[data-dropdown-content]', this.settings.opened)
        .on('closed.fndtn.dropdown', '[data-dropdown-content]', this.settings.closed);

      $(document).on('click.fndtn.dropdown', function (e) {
        var parent = $(e.target).closest('[data-dropdown-content]');

        if ($(e.target).closest('[data-dropdown]').length) { //Checks for any ancestor or self with data-dropdown
          return;
        }
        if (parent.length > 0 && ($(e.target).is('[data-dropdown-content]') || $.contains(parent.first()[0], e.target))) {
          e.stopPropagation();
          return;
        }

        self.close.call(self, $('[data-dropdown-content]'));
      });

      $(window).on('resize.fndtn.dropdown', self.throttle(function () {
        self.resize.call(self);
      }, 50)).trigger('resize');

      this.settings.init = true;
    },

    close: function (dropdown) {
      var self = this;
      dropdown.each(function () {
        if ($(this).hasClass(self.settings.activeClass)) {
          $(this)
            .css(Foundation.rtl ? 'right':'left', '-99999px')
            .removeClass(self.settings.activeClass);
          $(this).trigger('closed');
        }
      });
    },

    open: function (dropdown, target) {
        this
          .css(dropdown
            .addClass(this.settings.activeClass), target);
        dropdown.trigger('opened');
    },

    toggle : function (target) {
      var dropdown = $('#' + target.data('dropdown'));

      this.close.call(this, $('[data-dropdown-content]').not(dropdown));

      if (dropdown.hasClass(this.settings.activeClass)) {
        this.close.call(this, dropdown);
      } else {
        this.close.call(this, $('[data-dropdown-content]'))
        this.open.call(this, dropdown, target);
      }
    },

    resize : function () {
      var dropdown = $('[data-dropdown-content].open'),
          target = $("[data-dropdown='" + dropdown.attr('id') + "']");

      if (dropdown.length && target.length) {
        this.css(dropdown, target);
      }
    },

    css : function (dropdown, target) {
      var offset_parent = dropdown.offsetParent();
      // if (offset_parent.length > 0 && /body/i.test(dropdown.offsetParent()[0].nodeName)) {
        var position = target.offset();
        position.top -= offset_parent.offset().top;
        position.left -= offset_parent.offset().left;
      // } else {
      //   var position = target.position();
      // }

      if (this.small()) {
        dropdown.css({
          position : 'absolute',
          width: '95%',
          left: '2.5%',
          'max-width': 'none',
          top: position.top + this.outerHeight(target)
        });
      } else {
        if (!Foundation.rtl && $(window).width() > this.outerWidth(dropdown) + target.offset().left) {
          var left = position.left;
          if (dropdown.hasClass('right')) {
            dropdown.removeClass('right');
          }
        } else {
          if (!dropdown.hasClass('right')) {
            dropdown.addClass('right');
          }
          var left = position.left - (this.outerWidth(dropdown) - this.outerWidth(target));
        }

        dropdown.attr('style', '').css({
          position : 'absolute',
          top: position.top + this.outerHeight(target),
          left: left
        });
      }

      return dropdown;
    },

    small : function () {
      return $(window).width() < 768 || $('html').hasClass('lt-ie9');
    },

    off: function () {
      $(this.scope).off('.fndtn.dropdown');
      $('html, body').off('.fndtn.dropdown');
      $(window).off('.fndtn.dropdown');
      $('[data-dropdown-content]').off('.fndtn.dropdown');
      this.settings.init = false;
    },

    reflow : function () {}
  };
}(Foundation.zj, this, this.document));
