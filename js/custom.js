/*---------------------------------------------------------------------
    File Name: custom.js
---------------------------------------------------------------------*/

$(function () {
	
	"use strict";
	
	/* Tooltip
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function(){
		$('[data-toggle="tooltip"]').tooltip();
	});
	
	/* Mouseover
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
	
	$(document).ready(function(){
		$(".main-menu ul li.megamenu").mouseover(function(){
			if (!$(this).parent().hasClass("#wrapper")){
			$("#wrapper").addClass('overlay');
			}
		});
		$(".main-menu ul li.megamenu").mouseleave(function(){
			$("#wrapper").removeClass('overlay');
		});
	});
	
	/* Toggle sidebar
	-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
     
     $(document).ready(function () {
       $('#sidebarCollapse').on('click', function () {
          $('#sidebar').toggleClass('active');
          $(this).toggleClass('active');
       });
     });

     /* Carousel
     -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */
     if ($('#blogCarousel').length > 0) {
       $('#blogCarousel').carousel({
          interval: 5000
       });
     }

});

/* Navigation drawer helpers */
function openNav() {
  var sidepanel = document.getElementById("mySidepanel");
  var overlay = document.querySelector(".sidepanel-overlay");
  if (sidepanel) {
    sidepanel.classList.add("open");
  }
  if (overlay) {
    overlay.classList.add("show");
  }
  document.body.style.overflow = "hidden";
}

function closeNav() {
  var sidepanel = document.getElementById("mySidepanel");
  var overlay = document.querySelector(".sidepanel-overlay");
  if (sidepanel) {
    sidepanel.classList.remove("open");
  }
  if (overlay) {
    overlay.classList.remove("show");
  }
  document.body.style.overflow = "";
}
