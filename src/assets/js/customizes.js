$(function () {
  $('a.dropdown-toggle').on('click', function () {
    var parent = $(this);
  });

  $(document).on('mouseover', '.inline-label', function (e) {
    $(this).attr('title', $(this).clone().children().remove().end().text().trim());
  })
  $('a').click(function (e) {
    e.preventDefault();
  });
  $(document).on('show.bs.modal', '.modal', function () {
    var $this = $(this);
    $this.on('hidden.bs.modal', function () {
      $('body').removeClass("modal-open-noscroll");
      if ($('.modal').hasClass('in')) {
        $('body').addClass('modal-open');
      }
    });
    if ($(document).height() <= $(window).height()) {
      // no-scroll
      $('body').addClass("modal-open-noscroll");
    } else {
      $('body').removeClass("modal-open-noscroll");
    }
  });
  $(document).on('inserted.bs.tooltip', function (e) {
    var tooltip = $(e.target).data('bs.tooltip');
    tooltip.$tip.addClass($(e.target).data('tooltip-custom-class'));
  });
  $(document).on('click', '.nav-tabs li', function (e) {
    setTimeout(function () {
      if ($('.tab-pane.active [autofocus]').length) {
        $('.tab-pane.active [autofocus]')[0].focus();
      }
    }, 100);
  }).on('click', '.remove-file', function (e) {
    var $this = $(this);
    $this.parents('.existing-file-row').html('');
  });
  $(document).on('mouseover', '.ui-table-frozen-view .ui-table-scrollable-body tr', function (e) {
    var index = $(this).index();
    $('.ui-table-scrollable-body-table .ui-table-tbody').each(function () {
      $(this).find('tr').eq(index).addClass('tr-hover');
    });
  }).on('mouseout', '.ui-table-frozen-view .ui-table-scrollable-body tr', function (e) {
    $('.ui-table-scrollable-body-table .ui-table-tbody tr').each(function () {
      $(this).removeClass('tr-hover');
    });
  });
});

function fullScreen(element) {
  if (element.requestFullscreen)
    element.requestFullscreen();
  else if (element.mozRequestFullScreen)
    element.mozRequestFullScreen();
  else if (element.webkitRequestFullscreen)
    element.webkitRequestFullscreen();
  else if (element.msRequestFullscreen)
    element.msRequestFullscreen();
}

fullScreen('.fullscreen');

// starting the script on page load
$(document).ready(function () {
  $('[data-rel=tooltip]').tooltip();
  $('[data-rel=popover]').popover({ html: true });

  /* CONFIG */
  xOffset = 15;
  yOffset = 30;
  // these 2 variable determine popup's distance from the cursor
  // you might want to adjust to get the right result
  var Mx = $(document).width();
  var My = $(document).height();
  /* END CONFIG */
  var callback = function (event) {
    var $img = $("#preview");

    // top-right corner coords' offset
    var trc_x = xOffset + $img.width();
    var trc_y = yOffset + $img.height();

    trc_x = Math.min(trc_x + event.pageX, Mx);
    trc_y = Math.min(trc_y + event.pageY, My);

    $img.css("top", (trc_y - $img.height()) + "px")
      .css("left", (trc_x - $img.width()) + "px");
  };
  $(document).on({
    mouseenter: function (e) {
      Mx = $(document).width();
      My = $(document).height();
      this.t = this.title;
      this.title = "";
      var c = (this.t != "") ? "<br/>" + this.t : "";
      $("body").append("<p id='preview'><img src='" + this.src + "' alt='Image preview' />" + c + "</p>");
      callback(e);
      $("#preview").fadeIn("fast");
    },
    mouseleave: function () {
      this.title = this.t;
      $("#preview").remove();
    },
    mousemove: callback
  }, '.ui-fileupload-row img');
});
