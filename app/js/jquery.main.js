;(function($) {

	$(document).on('ready', function() {
		initPopUpClose();
		initBackgroundResize();
		initRetinaCover();
		initScrollToSection();
		initMobileMenu();
		initAnimateLine();
		initCloneNav();
		initAccordionNav();
		initFooterMenuAccordion();
		initFocusInput();
	});

	$(window).on('load', function() {
		initSlick();
	});

	function initFocusInput() {

		$('input:not(input[type="submit"], input[type="file"]), textarea').on('keyup', function() {
			if( $(this).val() !== '' ) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
	}

	function initSlick() {
		$('.slider-items').slick({
			dots: true,
			infinite: true,
			speed: 500,
			fade: true,
			cssEase: 'linear',
		});
	}

	function initAnimateLine() {
		// init controller
		var controller = new ScrollMagic.Controller();

		// build scene
		$('.block-step-holder').each(function() {
			var el = $(this).find('.step-circle');
			var scene = new ScrollMagic.Scene({triggerElement: el, triggerHook: '.5', duration: "0",})
							.setTween(el.find('.line'), .6, {height: '100%'}) // trigger a TweenMax.to tween
							// .addIndicators() // add indicators (requires plugin)
							.addTo(controller);
		});
	}

	function initScrollToSection() {

		$('.scroll-links-list').on('click', 'a', function(event){
			event.preventDefault();

			$('html, body').stop().animate({
				scrollTop: $( $.attr(this, 'href') ).offset().top
			}, 500);
		});
	}

	function initMobileMenu() {

		var menuEl = $('.mobile-btn');

		menuEl.on('click', function() {
			$(this).toggleClass('on');

			if( menuEl.hasClass('on') ) {
				TweenMax.to('.blackout', 1, {display:'block', autoAlpha: 1, ease: Power2.easeOut});
				TweenMax.to('.header-mobile', 1, {right: '-15px', autoAlpha: 1, ease: Power2.easeOut});
			} else {
				TweenMax.to('.header-mobile', 1, {right: '-101%', autoAlpha: 0, ease: Power2.easeIn});
				TweenMax.to('.blackout', 1, {autoAlpha: 0, display:'none', ease: Power2.easeOut});

			}
		});
	}

	function initCloneNav() {
		$('.top-nav').clone().attr('id','').removeClass('top-nav').addClass('nav-accordion').insertAfter($('.top-nav'))
	}

	function initAccordionNav() {

		$(document).on('click', '.nav-accordion .top-nav-link', function(e) {
			e.preventDefault();

			$(this).siblings('.drop').slideToggle();
			$(this).closest('li').siblings().find('.drop').slideUp();
		});
	}

	function initPopUpClose() {

		var idPopup = $('.announcement-popup').attr('id');

		if(!$.cookie(idPopup)) {
			$('.announcement-popup').addClass('visible')
		}

		$('.announcement-popup').on('click', '.announcement-popup-close', function() {
			$.cookie(idPopup, idPopup, { expires: 365, path: '/' });
			$(this).closest('.announcement-popup').removeClass('visible');
		});
	}

	function initFooterMenuAccordion() {
		$(document).on('click', '.footer-accordion .footer-accordion-title', function(e) {
			e.preventDefault();

			$(this).siblings('.footer-accordion-list').slideToggle();
			$(this)
				.closest('.footer-accordion')
				.siblings('.footer-accordion')
				.find('.footer-accordion-list')
				.slideUp();
		});
	}

	// stretch background to fill blocks
	function initBackgroundResize() {
		var win = jQuery(window);
		var resizetimer;
		var resizeHandler = function() {
			clearTimeout(resizetimer);
			resizetimer = setTimeout(function() {
				win.trigger('refresh-stretch');
			}, 500);
		};
		win.on('resize orientationchange', resizeHandler);
		jQuery('.img-stretch').each(function() {
			ImageStretcher.add({
				container: this,
				image: 'img:not(.bg-stretch img)'
			});
		});
	}

	/*
	 * Image Stretch module
	 */
	 var ImageStretcher = {
		getDimensions: function(data) {
			// calculate element coords to fit in mask
			var ratio = data.imageRatio || (data.imageWidth / data.imageHeight),
			slideWidth = data.maskWidth,
			slideHeight = slideWidth / ratio;

			if(slideHeight < data.maskHeight) {
				slideHeight = data.maskHeight;
				slideWidth = slideHeight * ratio;
			}
			return {
				width: slideWidth,
				height: slideHeight,
				top: (data.maskHeight - slideHeight) / 2,
				left: (data.maskWidth - slideWidth) / 2
			};
		},
		getRatio: function(image) {
			if(image.prop('naturalWidth')) {
				return image.prop('naturalWidth') / image.prop('naturalHeight');
			} else {
				var img = new Image();
				img.src = image.prop('src');
				return img.width / img.height;
			}
		},
		imageLoaded: function(image, callback) {
			var self = this;
			var loadHandler = function() {
				callback.call(self);
			};
			if(image.prop('complete')) {
				loadHandler();
			} else {
				image.one('load', loadHandler);
			}
		},
		resizeHandler: function() {
			var self = this;
			jQuery.each(this.imgList, function(index, item) {
				if(item.image.prop('complete')) {
					self.resizeImage(item.image, item.container);
				}
			});
		},
		resizeImage: function(image, container) {
			this.imageLoaded(image, function() {
				var styles = this.getDimensions({
					imageRatio: this.getRatio(image),
					maskWidth: container.width(),
					maskHeight: container.height()
				});
				image.css({
					width: styles.width,
					height: styles.height,
					marginTop: styles.top,
					marginLeft: styles.left
				});
			});
		},
		add: function(options) {
			var container = jQuery(options.container ? options.container : window),
			image = typeof options.image === 'string' ? container.find(options.image) : jQuery(options.image);

			// resize image
			this.resizeImage(image, container);

			// add resize handler once if needed
			if(!this.win) {
				this.resizeHandler = jQuery.proxy(this.resizeHandler, this);
				this.imgList = [];
				this.win = jQuery(window);
				this.win.on('resize orientationchange refresh-stretch', this.resizeHandler);
			}

			// store item in collection
			this.imgList.push({
				container: container,
				image: image
			});
		}
	};

	/*
	 * jQuery retina cover plugin
	 */
	 ;(function($) {
		'use strict';

		var styleRules = {};
		var templates = {
			'2x': [
			'(-webkit-min-device-pixel-ratio: 1.5)',
			'(min-resolution: 192dpi)',
			'(min-device-pixel-ratio: 1.5)',
			'(min-resolution: 1.5dppx)'
			],
			'3x': [
			'(-webkit-min-device-pixel-ratio: 3)',
			'(min-resolution: 384dpi)',
			'(min-device-pixel-ratio: 3)',
			'(min-resolution: 3dppx)'
			]
		};

		function addSimple(imageSrc, media, id) {
			var style = buildRule(id, imageSrc);

			addRule(media, style);
		}

		function addRetina(imageData, media, id) {
			var currentRules = templates[imageData[1]].slice();
			var patchedRules = currentRules;
			var style = buildRule(id, imageData[0]);

			if (media !== 'default') {
				patchedRules = $.map(currentRules, function(ele, i) {
					return ele + ' and ' + media;
				});
			}

			media = patchedRules.join(',');

			addRule(media, style);
		}

		function buildRule(id, src) {
			return '#' + id + '{background-image: url("' + src + '");}';
		}

		function addRule(media, rule) {
			var $styleTag = styleRules[media];
			var styleTagData;
			var rules = '';

			if (media === 'default') {
				rules = rule + ' ';
			} else {
				rules = '@media ' + media + '{' + rule + '}';
			}

			if (!$styleTag) {
				styleRules[media] = $('<style>').text(rules).appendTo('head');
			} else {
				styleTagData = $styleTag.text();
				styleTagData = styleTagData.substring(0, styleTagData.length - 2) + ' }' + rule + '}';
				$styleTag.text(styleTagData);
			}
		}

		$.fn.retinaCover = function() {
			return this.each(function() {
				var $block = $(this);
				var $items = $block.children('[data-srcset]');
				var id = 'bg-stretch' + Date.now() + (Math.random() * 1000).toFixed(0);

				if ($items.length) {
					$block.attr('id', id);

					$items.each(function() {
						var $item = $(this);
						var data = $item.data('srcset').split(', ');
						var media = $item.data('media') || 'default';
						var dataLength = data.length;
						var itemData;
						var i;

						for (i = 0; i < dataLength; i++) {
							itemData = data[i].split(' ');

							if (itemData.length === 1) {
								addSimple(itemData[0], media, id);
							} else {
								addRetina(itemData, media, id);
							}
						}
					});
				}

				// $items.detach();
			});
		};
	 }(jQuery));

	 function initRetinaCover() {
		var imageStyles = {
			position:'absolute',
			top:0,
			left:0,
			maxWidth:'none',
			minHeight:'100%',
			width:'auto',
			height:'auto'
		};
		var scaleImage = function(holder, image, ratio) {
			var styles = ImageStretcher.getDimensions({
				imageRatio: ImageStretcher.getRatio(image),
				maskWidth: holder.width(),
				maskHeight: holder.height()
			});
			image.css({
				width: styles.width,
				height: styles.height,
				marginTop: styles.top,
				marginLeft: styles.left
			});
		};
		if(jQuery.support.opacity === false) { // is IE8 ?
			jQuery('.bg-stretch').each(function() {
				var holder = jQuery(this);
				var image = new Image();
				var rules = holder.find('[data-srcset]');
				image.src = rules.eq(0).data('srcset').split(',')[0];
				holder.find('img').detach();
				image = jQuery(image).css(imageStyles).appendTo(holder);
				var timer;
				scaleImage(holder, image);
				holder.closest('.tab-opener').off('.scaleImage').on('mouseenter.scaleImage mouseleave.scaleImage', function() {
					jQuery(this).siblings().trigger('scale');
					clearTimeout(timer);
					timer = setTimeout(function() {
						scaleImage(holder, image);
					}, 25);
				}).on('scale.scaleImage', function() {
					clearTimeout(timer);
					timer = setTimeout(function() {
						scaleImage(holder, image);
					}, 25);
				});
			});
		} else { // nope
			jQuery('.bg-stretch').retinaCover();
		}
	 }




	 // page init
	 function initPage(){
		initTouchNav();
	 }

	 // handle dropdowns on mobile devices
	 function initTouchNav() {
		lib.each(lib.queryElementsBySelector('#nav'), function(){
			new TouchNav({
				navBlock: this
			});
		});
	 }

	 // navigation accesibility module
	 function TouchNav(opt) {
		this.options = {
			hoverClass: 'hover',
			menuItems: 'li',
			menuOpener: 'a',
			menuDrop: 'ul',
			navBlock: null
		};
		for(var p in opt) {
			if(opt.hasOwnProperty(p)) {
				this.options[p] = opt[p];
			}
		}
		this.init();
	 }
	 TouchNav.isActiveOn = function(elem) {
		return elem && elem.touchNavActive;
	 };
	 TouchNav.prototype = {
		init: function() {
			if(typeof this.options.navBlock === 'string') {
				this.menu = document.getElementById(this.options.navBlock);
			} else if(typeof this.options.navBlock === 'object') {
				this.menu = this.options.navBlock;
			}
			if(this.menu) {
				this.addEvents();
			}
		},
		addEvents: function() {
			// attach event handlers
			var self = this;
			var touchEvent = (navigator.pointerEnabled && 'pointerdown') || (navigator.msPointerEnabled && 'MSPointerDown') || (this.isTouchDevice && 'touchstart');
			this.menuItems = lib.queryElementsBySelector(this.options.menuItems, this.menu);

			var initMenuItem = function(item) {
				var currentDrop = lib.queryElementsBySelector(self.options.menuDrop, item)[0],
					currentOpener = lib.queryElementsBySelector(self.options.menuOpener, item)[0];

				// only for touch input devices
				if( currentDrop && currentOpener && (self.isTouchDevice || self.isPointerDevice) ) {
					lib.event.add(currentOpener, 'click', lib.bind(self.clickHandler, self));
					lib.event.add(currentOpener, 'mousedown', lib.bind(self.mousedownHandler, self));
					lib.event.add(currentOpener, touchEvent, function(e){
						if( !self.isTouchPointerEvent(e) ) {
							self.preventCurrentClick = false;
							return;
						}
						self.touchFlag = true;
						self.currentItem = item;
						self.currentLink = currentOpener;
						self.pressHandler.apply(self, arguments);
					});
				}
				// for desktop computers and touch devices
				lib.event.add(item, 'mouseover', function(){
					if(!self.touchFlag) {
						self.currentItem = item;
						self.mouseoverHandler();
					}
				});
				lib.event.add(item, 'mouseout', function(){
					if(!self.touchFlag) {
						self.currentItem = item;
						self.mouseoutHandler();
					}
				});
				item.touchNavActive = true;
			};

			// addd handlers for all menu items
			for(var i = 0; i < this.menuItems.length; i++) {
				initMenuItem(self.menuItems[i]);
			}

			// hide dropdowns when clicking outside navigation
			if(this.isTouchDevice || this.isPointerDevice) {
				lib.event.add(document.documentElement, 'mousedown', lib.bind(this.clickOutsideHandler, this));
				lib.event.add(document.documentElement, touchEvent, lib.bind(this.clickOutsideHandler, this));
			}
		},
		mousedownHandler: function(e) {
			if(this.touchFlag) {
				e.preventDefault();
				this.touchFlag = false;
				this.preventCurrentClick = false;
			}
		},
		mouseoverHandler: function() {
			lib.addClass(this.currentItem, this.options.hoverClass);
		},
		mouseoutHandler: function() {
			lib.removeClass(this.currentItem, this.options.hoverClass);
		},
		hideActiveDropdown: function() {
			for(var i = 0; i < this.menuItems.length; i++) {
				if(lib.hasClass(this.menuItems[i], this.options.hoverClass)) {
					lib.removeClass(this.menuItems[i], this.options.hoverClass);
				}
			}
			this.activeParent = null;
		},
		pressHandler: function(e) {
			// hide previous drop (if active)
			if(this.currentItem !== this.activeParent) {
				if(this.activeParent && this.currentItem.parentNode === this.activeParent.parentNode) {
					lib.removeClass(this.activeParent, this.options.hoverClass);
				} else if(!this.isParent(this.activeParent, this.currentLink)) {
					this.hideActiveDropdown();
				}
			}
			// handle current drop
			this.activeParent = this.currentItem;
			if(lib.hasClass(this.currentItem, this.options.hoverClass)) {
				this.preventCurrentClick = false;
			} else {
				e.preventDefault();
				this.preventCurrentClick = true;
				lib.addClass(this.currentItem, this.options.hoverClass);
			}
		},
		clickHandler: function(e) {
			// prevent first click on link
			if(this.preventCurrentClick) {
				e.preventDefault();
			}
		},
		clickOutsideHandler: function(event) {
			var e = event.changedTouches ? event.changedTouches[0] : event;
			if(this.activeParent && !this.isParent(this.menu, e.target)) {
				this.hideActiveDropdown();
				this.touchFlag = false;
			}
		},
		isParent: function(parent, child) {
			while(child.parentNode) {
				if(child.parentNode == parent) {
					return true;
				}
				child = child.parentNode;
			}
			return false;
		},
		isTouchPointerEvent: function(e) {
			return (e.type.indexOf('touch') > -1) ||
					(navigator.pointerEnabled && e.pointerType === 'touch') ||
					(navigator.msPointerEnabled && e.pointerType == e.MSPOINTER_TYPE_TOUCH);
		},
		isPointerDevice: (function() {
			return !!(navigator.pointerEnabled || navigator.msPointerEnabled);
		}()),
		isTouchDevice: (function() {
			return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
		}())
	 };

	 /*
		* Utility module
		*/
	 lib = {
		hasClass: function(el,cls) {
			return el && el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
		},
		addClass: function(el,cls) {
			if (el && !this.hasClass(el,cls)) el.className += " "+cls;
		},
		removeClass: function(el,cls) {
			if (el && this.hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
		},
		extend: function(obj) {
			for(var i = 1; i < arguments.length; i++) {
				for(var p in arguments[i]) {
					if(arguments[i].hasOwnProperty(p)) {
						obj[p] = arguments[i][p];
					}
				}
			}
			return obj;
		},
		each: function(obj, callback) {
			var property, len;
			if(typeof obj.length === 'number') {
				for(property = 0, len = obj.length; property < len; property++) {
					if(callback.call(obj[property], property, obj[property]) === false) {
						break;
					}
				}
			} else {
				for(property in obj) {
					if(obj.hasOwnProperty(property)) {
						if(callback.call(obj[property], property, obj[property]) === false) {
							break;
						}
					}
				}
			}
		},
		event: (function() {
			var fixEvent = function(e) {
				e = e || window.event;
				if(e.isFixed) return e; else e.isFixed = true;
				if(!e.target) e.target = e.srcElement;
				e.preventDefault = e.preventDefault || function() {this.returnValue = false;};
				e.stopPropagation = e.stopPropagation || function() {this.cancelBubble = true;};
				return e;
			};
			return {
				add: function(elem, event, handler) {
					if(!elem.events) {
						elem.events = {};
						elem.handle = function(e) {
							var ret, handlers = elem.events[e.type];
							e = fixEvent(e);
							for(var i = 0, len = handlers.length; i < len; i++) {
								if(handlers[i]) {
									ret = handlers[i].call(elem, e);
									if(ret === false) {
										e.preventDefault();
										e.stopPropagation();
									}
								}
							}
						};
					}
					if(!elem.events[event]) {
						elem.events[event] = [];
						if(elem.addEventListener) elem.addEventListener(event, elem.handle, false);
						else if(elem.attachEvent) elem.attachEvent('on'+event, elem.handle);
					}
					elem.events[event].push(handler);
				},
				remove: function(elem, event, handler) {
					var handlers = elem.events[event];
					for(var i = handlers.length - 1; i >= 0; i--) {
						if(handlers[i] === handler) {
							handlers.splice(i,1);
						}
					}
					if(!handlers.length) {
						delete elem.events[event];
						if(elem.removeEventListener) elem.removeEventListener(event, elem.handle, false);
						else if(elem.detachEvent) elem.detachEvent('on'+event, elem.handle);
					}
				}
			};
		}()),
		queryElementsBySelector: function(selector, scope) {
			scope = scope || document;
			if(!selector) return [];
			if(selector === '>*') return scope.children;
			if(typeof document.querySelectorAll === 'function') {
				return scope.querySelectorAll(selector);
			}
			var selectors = selector.split(',');
			var resultList = [];
			for(var s = 0; s < selectors.length; s++) {
				var currentContext = [scope || document];
				var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
				for (var i = 0; i < tokens.length; i++) {
					token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
					if (token.indexOf('#') > -1) {
						var bits = token.split('#'), tagName = bits[0], id = bits[1];
						var element = document.getElementById(id);
						if (element && tagName && element.nodeName.toLowerCase() != tagName) {
							return [];
						}
						currentContext = element ? [element] : [];
						continue;
					}
					if (token.indexOf('.') > -1) {
						var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
						for (var h = 0; h < currentContext.length; h++) {
							var elements;
							if (tagName == '*') {
								elements = currentContext[h].getElementsByTagName('*');
							} else {
								elements = currentContext[h].getElementsByTagName(tagName);
							}
							for (var j = 0; j < elements.length; j++) {
								found[foundCount++] = elements[j];
							}
						}
						currentContext = [];
						var currentContextIndex = 0;
						for (var k = 0; k < found.length; k++) {
							if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
								currentContext[currentContextIndex++] = found[k];
							}
						}
						continue;
					}
					if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
						var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
						if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
							attrName = 'htmlFor';
						}
						var found = [], foundCount = 0;
						for (var h = 0; h < currentContext.length; h++) {
							var elements;
							if (tagName == '*') {
								elements = currentContext[h].getElementsByTagName('*');
							} else {
								elements = currentContext[h].getElementsByTagName(tagName);
							}
							for (var j = 0; elements[j]; j++) {
								found[foundCount++] = elements[j];
							}
						}
						currentContext = [];
						var currentContextIndex = 0, checkFunction;
						switch (attrOperator) {
							case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
							case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
							case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
							case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
							case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
							case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
							default : checkFunction = function(e) { return e.getAttribute(attrName) };
						}
						currentContext = [];
						var currentContextIndex = 0;
						for (var k = 0; k < found.length; k++) {
							if (checkFunction(found[k])) {
								currentContext[currentContextIndex++] = found[k];
							}
						}
						continue;
					}
					tagName = token;
					var found = [], foundCount = 0;
					for (var h = 0; h < currentContext.length; h++) {
						var elements = currentContext[h].getElementsByTagName(tagName);
						for (var j = 0; j < elements.length; j++) {
							found[foundCount++] = elements[j];
						}
					}
					currentContext = found;
				}
				resultList = [].concat(resultList,currentContext);
			}
			return resultList;
		},
		trim: function (str) {
			return str.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		bind: function(f, scope, forceArgs){
			return function() {return f.apply(scope, typeof forceArgs !== 'undefined' ? [forceArgs] : arguments);};
		}
	 };

	 if(window.addEventListener) window.addEventListener('load', initPage, false);
	 else if(window.attachEvent) window.attachEvent('onload', initPage);

})(jQuery)




function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		disableDefaultUI: false,
		scrollwheel: false,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: false,
		center: {lat: 43.0653193, lng: -79.9578928},
		styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}]
	});

	var image = 'images/pin.png';
	var beachMarker = new google.maps.Marker({
		position: {lat: 43.0653193, lng: -79.9578928},
		map: map,
		icon: image
	});
}




