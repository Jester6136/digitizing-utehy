/**
 * Created by gitkv on 02.03.16, edit by phucnh on 17.08.18.
 */
'use strict';

;
(function ($) {
  $.notification = {
    settings: {
      time: 400,
      delay: 10000,
      closable: true,
      clickToClose: false,
      position: 'top-right'
    },
    element: '.notification_block',
    elementClose: '.notification_block .close_notice',
    count: 0,
    elementBuffer: [],
    timerBuffer: {},
    /**
     * показ сообщения
     * @param type
     * @param text
     * @returns {*|number}
     */
    show: function (type, text) {
      var that = this;
      var elementId = this.append(type, text);
      var element = this.elementBuffer[elementId];
      this.restructuring(elementId);
      element.fadeIn(this.settings.time);

      var timer = setTimeout(function () {
        that.hide(elementId);
      }, this.settings.delay);
      this.timerBuffer[elementId] = timer;

      $(document).on("click", this.elementClose, function () {
        var noteId = $(this).parents(that.element).data('id');
        that.hide(noteId);
        return false;
      });

      $(document).on("mouseover", this.element, function () {
        var noteId = $(this).data('id');
        clearTimeout(that.timerBuffer[noteId]);
        // var timer = setTimeout(function () {
        //   that.hide(noteId);
        // }, that.settings.delay);
        // that.timerBuffer[noteId] = timer;
      });

      $(document).on("mouseout", this.element, function () {
        var noteId = $(this).data('id');
        var timer = setTimeout(function () {
          that.hide(noteId);
        }, that.settings.delay);
        that.timerBuffer[noteId] = timer;
      });

      if (this.settings.clickToClose) {
        $(document).on("click", this.element, function () {
          var noteId = $(this).data('id');
          that.hide(noteId);
          return false;
        });
      }
      return elementId;
    },
    /**
     * скрытие сообщения
     * @param elementId
     * @returns {boolean}
     */
    hide: function (elementId) {
      var that = this;
      var element = this.elementBuffer[elementId];
      if (typeof element != 'undefined') {
        element.fadeOut(this.settings.time);
        setTimeout(function () {
          element.remove();
          delete that.elementBuffer[elementId];
          that.restructuring(elementId);
        }, that.settings.time);
        return true;
      }
      return false;
    },
    /**
     * добавление сообщения
     * @param type
     * @param text
     * @returns {number}
     */
    append: function (type, text) {
      var that = this;
      var templete =
        '<div id="note_' + this.count + '" data-id="' + this.count + '" class="notification_block ' + type + ' ' + that.settings.position + '">' +
        (that.settings.closable ? '<a class="close_notice" href="#"></a>' : '') +
        '<div class="content_notice">' + text + '</div>' +
        '</div>';
      $('body').append(templete);
      this.elementBuffer[this.count] = $(document).find('#note_' + this.count);
      this.count++;
      return this.count - 1;
    },
    /**
     * перерасчет позиций блоков
     */
    restructuring: function () {
      var that = this;
      var elements = this.elementBuffer;
      var newPosY = 20;
      for (var i in elements) {
        if (!elements.hasOwnProperty(i)) continue;
        switch (that.settings.position) {
          case 'top-right':
            {
              elements[i].css({
                top: newPosY + 'px'
              });
              var elementTop = elements[i].css('top');
              var elementHeight = elements[i].outerHeight();
              newPosY = parseInt(elementTop) + parseInt(elementHeight) + 10;
              break;
            }
          case 'bottom-right':
            {
              elements[i].css({
                bottom: newPosY + 'px'
              });
              var elementTop = elements[i].css('bottom');
              var elementHeight = elements[i].outerHeight();
              newPosY = parseInt(elementTop) + parseInt(elementHeight) + 10;
              break;
            }
        }
      }
    },
    /**
     * инициализация
     * @param options
     * @returns {$.notification}
     */
    init: function (options) {
      this.settings = $.extend(this.settings, options);

      return this;
    }
  };
})(jQuery);
