// console.log($("#tags-element a"));
$("#tags-element a").on("click", function () {
  $(this).addClass("active");
  $("#tags-element").scrollCenter(".active", 300);
});

// $("#tags .filter_btn").on("click", function () {
//   $(this).addClass("tab-active");
//   $("#tags").scrollCenter(".tab-active", 300);
// });

jQuery.fn.scrollCenter = function (elem, speed) {
  // this = #timepicker
  // elem = .active

  var active = jQuery(this).find(elem); // find the active element
  //var activeWidth = active.width(); // get active width
  var activeWidth = active.width() / 2; // get active width center
  // console.log(activeWidth);
  //alert(activeWidth)

  //var pos = jQuery('#timepicker .active').position().left; //get left position of active li
  // var pos = jQuery(elem).position().left; //get left position of active li
  //var pos = jQuery(this).find(elem).position().left; //get left position of active li

  var pos = active.position().left + activeWidth; //get left position of active li + center position
  var currentscroll = jQuery(this).scrollLeft(); // get current scroll position
  var divwidth = jQuery(this).width(); //get div width
  //var divwidth = jQuery(elem).width(); //get div width
  pos = pos + currentscroll - divwidth / 2; // for center position if you want adjust then change this
  // console.log(pos);
  jQuery(this).animate(
    {
      scrollLeft: pos,
    },
    speed == undefined ? 1000 : speed
  );
  return this;
};

// http://podzic.com/wp-content/plugins/podzic/include/js/podzic.j