<h2>jfCarousel</h2>

<p>jfCarousel is a jQuery carousel.</p>

<p>Library dependencies:</p>

<ul>
	<li>jQuery</li>
	<li>GreenSock
		<ul>
			<li>TweenLite</li>
			<li>EasePack</li>
			<li>CSSPlugin</li>
		</ul>
	</li>
</ul>

<h3>Plugin Initialization Example</h3>

<p>You can change all the default options using the code below.</p>

<pre>

	// HTML
	&lt;div class="carousel"&gt;
		&lt;div class="slide" data-src="images/vintage-grey-airplane-plane.jpg"&gt;&lt;/div&gt;
		&lt;div class="slide" data-src="images/beach.jpg"&gt;&lt;/div&gt;
		&lt;div class="slide" data-src="images/city.jpg"&gt;&lt;/div&gt;
		&lt;div class="slide" data-src="images/road.jpg"&gt;&lt;/div&gt;
	&lt;/div&gt;

	// Javascript
	$(".carousel").jfCarousel({
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
	});
</pre>

<p>You can also just use all of the default options above by not passing in an object.</p>

<pre>
	$(".carousel").jfCarousel();
</pre>