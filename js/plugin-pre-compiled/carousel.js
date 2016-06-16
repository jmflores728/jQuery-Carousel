/**
 * jfCarousel.js v1.0.0
 * http://www.jeff-flores.com
 * 
 * Copyright 2015
 */
;(function($, window, document, undefined) {

	var Carousel = {
		currentSlide: 0,
		animating: false,
		paused: false,
		carouselTimer: 0,
		init: function(options, elem) {
			var self = this;
			this.elem = elem;
			this.$elem = $(elem);

			this.options = $.extend({}, $.fn.jfCarousel.options, options);
			for (var key in this.options) {
			  if (this.options.hasOwnProperty(key)) {
			  	this[key] = this.options[key];
			  }
			}
			this.slides = this.$elem.find(".slide");
			this.slides.first().addClass("active");

			// Auto Animate
			if (this.autoAnimate) { this.timer(); }
					
			if (this.slideAnimation === "slide") { // Slider
				this.slidesWrapper = $('<div class="wrapper" />').css({ overflow: "hidden", height: this.slides.outerHeight(), position: "relative" });
				this.$elem.prepend(this.slidesWrapper);
				this.slides.appendTo(this.slidesWrapper);
				this.previousSlide = this.slides.length - 1;
				this.slides = this.$elem.find(".slide").css("float", "left");
				this.slides.first().addClass("active");
			} else { // Fader
				this.$elem.addClass("fader").height(this.slides.outerHeight());
				this.slides.css({ position:"absolute", top:0, left:0, opacity:0 }).first().css({ opacity:1 });
			}

			// Control Arrows
			if (this.arrows) {
				this.leftArrow = $('<span class="prev" />');
				this.rightArrow = $('<span class="next" />');
				this.$elem.append(this.leftArrow);
				this.$elem.append(this.rightArrow);
			}
			// Pagination
			if (this.pagination) { this.setupPagination(); }

			// Left Arrow
			this.$elem.find(".prev").on('click', function(e) {
				self.goDirection("left");
				e.preventDefault();
			});
			// Right Arrow
			this.$elem.find(".next").on('click', function(e) {
				self.goDirection("right");
				e.preventDefault();
			});
			// Screen Resize
			$(window).resize(function() {
				if (self.autoAnimate && !self.paused) {
					self.stopTimer();
					self.timer();
				}			
				self.adjustDimentions();
			});
			// Window Focus
			$(window).focus(function() {
				if (!self.slides.eq(self.currentSlide).is(":visible")) {
					self.slides.eq(self.currentSlide).show().css({ opacity: 1 });
				}
			});
			// Pause on Hover
			if (this.pauseOnHover && this.autoAnimate) {
				this.$elem.hover(function() {
					self.stopTimer();
				}, function() {
					self.timer.call(self);
				});
			}
			// Adjust Carousel Dimentions
			this.adjustDimentions();
			TweenLite.to(this.$elem, 0.8, { autoAlpha: 1 });
			this.$elem.data(this);

			// Lazy Load
			if (this.lazyLoad) { this.lazyLoadInit(); }
		},
		setupPagination: function() {
			var self = this;
			if (this.paginationType === "icons") {
				this.pagination = $("<div class='slider-pagination'></div>");
				for (var i=0; i<this.slides.length; i++) {
					this.pagination.append("<a class='pagination-icon' data-slide='" + i + "'>" + i + "</a>");
				}
				this.$elem.append(this.pagination);
				this.paginationIcons = this.pagination.find(".pagination-icon");
				this.paginationIcons.filter("[data-slide='"+0+"']").addClass("active");
				this.pagination.find(".pagination-icon").on('click', function(e) {
					if (!$(this).hasClass("active")) {
						self.goToSlide($(this).data("slide"));
					}
					e.preventDefault();
				});
			} else { // paginationType: counter
				this.pagination = $("<div class='slider-pagination counter'>" + (this.currentSlide + 1) + this.paginationDivider + this.slides.length  + "</div>");
				this.$elem.append(this.pagination);
			}
		},
		adjustDimentions: function() {
			var self = this;
			this.loadMoreSlides();
			if (this.fullScreen) {
				this.slides.css({
					height: $(window).height(),
					width: $(window).width()
				});
				this.$elem.height(this.slides.outerHeight());
				this.slidesWidth = $(window).width();
			} else if (this.slides.first().css("background")) {
				this.slides.css({
					width: this.$elem.outerWidth()
				});
				this.$elem.height(this.slides.outerHeight());
				this.slidesWidth = this.$elem.outerWidth();
			}
			if (this.slideAnimation === "slide") { this.slidesWrapper.height(this.slides.outerHeight()); }
		},
		timer: function () {
			var self = this;
			this.paused = false;
			clearInterval(this.carouselTimer);
			this.carouselTimer = setInterval(function() {
				self.goDirection("right");
			}, self.slideDuration);
		},
		stopTimer: function() {
			this.paused = true;
			clearInterval(this.carouselTimer);
			this.carouselTimer = null;
		},
		goToSlide: function(slide) {
			var self = this;
			if (!this.animating) {
				self.previousSlide = self.currentSlide;
				self.currentSlide = slide;
				direction = (self.previousSlide < self.currentSlide) ? "right" : "left";
				// direction = (self.previousSlide === self.slides.length-1 && self.currentSlide === 0) ? "right" : direction;
				self.animateSlides(self.previousSlide, self.currentSlide, direction);
				return true;
			} else { return false; }
		},
		goDirection: function(direction) {
			if (!this.animating) {
				var self = this;
				this.previousSlide = this.currentSlide;

				if (this.isAnimating) this.isAnimating();
				if (this.autoAnimate && !this.paused) { this.stopTimer(); this.timer(); }

				if (direction === "left") {
					this.currentSlide = (this.currentSlide === 0) ? this.slides.length-1 : this.currentSlide-1;
				} else {
					this.currentSlide = (this.currentSlide === this.slides.length-1) ? 0 : this.currentSlide+1;
				}

				this.animateSlides(this.previousSlide, this.currentSlide, direction);
				return true;
			} else { return false; }
		},
		animateSlides: function(oldSlide, newSlide, direction) {
			if(!this.animating) {
				var self = this;
				var next = this.slides.eq(newSlide);
				var prev = this.slides.eq(oldSlide);

				this.slides.removeClass("active");
				next.addClass("arriving");
				prev.addClass("leaving");
				this.animating = true;
				this.loadMoreSlides();

				if (this.isAnimating) this.isAnimating();
				if (this.arrivingFunction) this.arrivingFunction(next);
				if (this.leavingFunction) this.leavingFunction(prev);
				if (this.autoAnimate && !this.paused) { this.stopTimer(); this.timer(); }
				if (this.pagination) {
					if (this.paginationType == "icons") {
						this.paginationIcons.removeClass("active").filter("[data-slide='" + this.currentSlide + "']").addClass("active");
					} else {
						this.pagination.text((this.currentSlide + 1) + this.paginationDivider + this.slides.length);
					}
				}

				if (this.slideAnimation === "slide") { // Slide Animation
					modifier = (direction === "left") ? -1 : 1;
					TweenLite.set(next, { x: modifier * this.slidesWidth });
					TweenLite.to(next, this.animationSpeed/1000, { delay: this.animationDelay/1000, x: 0, ease: Power2.easeOut });
					TweenLite.to(
						prev, this.animationSpeed/1000, { 
							delay: this.animationDelay/1000, x: -modifier * this.slidesWidth, ease: Power2.easeOut, onComplete: function() { self.animationComplete(); }
						});
				} else { // Fade Animation
					TweenLite.set(next, { alpha: 0, zIndex: 2000 });
					TweenLite.to(next, self.animationSpeed/1000, { delay: this.animationDelay/1000, alpha: 1 });
					TweenLite.set(prev, { alpha: 1, zIndex: 1000 });
					TweenLite.to(prev, 0, { delay: (self.animationSpeed/1000) + (this.animationDelay/1000), alpha: 0, onComplete: function() { self.animationComplete(); } });
				}
				return true;
			} else { return false; }
		},
		animationComplete: function() {
			var self = this;
			var prev = this.slides.eq(this.previousSlide);
			var current = this.slides.eq(this.currentSlide);
			this.animating = false;
			prev.removeClass("leaving");
			current.removeClass("arriving").addClass("active");
			if (this.activeFunction) this.activeFunction(current);
		},
		lazyLoadInit: function() {
			var self = this;
			for (var i = 0; i < (this.lazyLoadSlides); i++) {
				if (this.slides.eq(i).data("src")) { this.loadBackgroundImage(this.slides, i); }
			}
			if (this.slides.eq(this.lazyLoadSlides+1).data("src")) {
				this.loadBackgroundImage(this.slides, this.lazyLoadSlides);
			}
			if (this.slides.eq(this.slides.length-1).data("src")) {
				this.loadBackgroundImage(this.slides, this.slides.length-1);
			}
		},
		loadMoreSlides: function() {
			for (var i = 0; i < this.lazyLoadSlides; i++) {
				var slide = this.currentSlide + i;
				if (this.slides.eq(slide).data("src") && slide <= this.slides.length) {
					this.loadBackgroundImage(this.slides, this.currentSlide + i);
				}
			}
			if (this.slides.eq(this.currentSlide - 1).data("src") && this.currentSlide - 1 >= 0) {
				this.loadBackgroundImage(this.slides, this.currentSlide - 1);
			}
		},
		loadBackgroundImage: function(slides, index) {
			slides.eq(index)
				.css({ "backgroundImage": "url(" + slides.eq(index).data("src") + ")" })
				.removeAttr("data-src");
		}
	};

	$.fn.jfCarousel = function(options) {
		return this.each(function() {
			var carousel = Object.create(Carousel);
			carousel.init(options, this);
		});
	};

	$.fn.jfCarousel.options = {
		slideAnimation: "fade", // fade, slide
		animationSpeed: 1000, // Animation transition speed
		animationDelay: 0, // How long to wait before animating
		slideDuration: 8000, // How long on slide before auto animation
		autoAnimate: false, // Auto animate slides with slideDuration as timer
		pauseOnHover: true, // Pause auto animation one carousel hover
		fullScreen: false, // Makes slides the same height/width as window
		arrows: true, // Adds arrow control buttons

		pagination: false, // Slider has pagination
		paginationType: 'icons', // 'icons', 'counter'
		paginationDivider: ' / ', // Character that divides current slide and slide count. ex: 1 / 8

		arrivingFunction: null, // Function called before slide animation, returns next slide
		leavingFunction: null, // Function called before slide animation, returns prev slide
		activeFunction: null, // Function called after slide animation, returns current slide

		lazyLoad: true, // Only load a few slides at a time
		lazyLoadSlides: 1 // First number of slides to load before page load (including 1st slide)
	};

})(jQuery, window, document);

