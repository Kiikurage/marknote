(function() {
	var easing = {
		easeInOutQuint: function(t, b, c, d) {
			x = t / d;
			return x > 0.5 ?
				1 - 8 * (x -= 1) * x * x * x :
				8 * x * x * x * x;
		}
	};

	extend(bQuery.prototype, {
		animate: function(fn, duration, easingType) {

			var that = this,
				duration = duration || 300,
				easingType = easingType || "easeInOutQuint",
				core = function() {
					var n = +(new Date()),
						x = (n - s > duration) ? 1 : easing[easingType](n - s, 0, 1, duration)


					fn.call(that, x);

					if (x >= 1) {
						that.fire("AnimationCompleted");
						delete s;
						delete core;
						delete fn;
						delete duration;
						delete that;
						return;
					}

					requestAnimationFrame(core);
				};

			var s = +(new Date());
			requestAnimationFrame(core);

			return this;
		}
	});

	extend(bQuery.prototype, {
		fadeIn: function(duration) {
			this.animate(function(x) {
				this.css("opacity", x);
			}, duration);

			return this;
		},
		fadeOut: function(duration) {
			this.animate(function(x) {
				this.css("opacity", 1 - x);
			}, duration);

			return this;
		}
	});

	extend(bQuery.prototype, {
		slideUp: function(duration) {
			var originalHeights = [],
				that = this;

			this.map(function(element, i) {
				originalHeights[i] = parseInt(getComputedStyle(element).height);
			});
			this.one("AnimationCompleted", function() {
				this.css("height", 0);
			}, this);
			that.animate(function(x) {
				this.map(function(element, i) {
					element.style.height = originalHeights[i] * (1.0 - x) + "px";
				});
			}, duration);
		},
		slideDown: function(duration) {
			var currentHeights = [],
				originalHeights = [],
				that = this;

			this.map(function(element, i) {
				currentHeights[i] = parseInt(getComputedStyle(element).height);
			});

			this.css({
				height: "",
				display: "block",
				visibility: "hidden",
				position: "absolute",
			});
			this.one("AnimationCompleted", function() {
				this.css("height", "");
			}, this);

			setTimeout(function() {
				that.map(function(element, i) {
					originalHeights[i] = parseInt(getComputedStyle(element).height);
					element.style.height = currentHeights[i] + "px";
					element.style.display = "";
					element.style.visibility = "";
					element.style.position = "";
				});

				that.animate(function(x) {
					this.map(function(element, i) {
						element.style.height = originalHeights[i] * x + currentHeights[i] * (1.0 - x) + "px";
					});
				}, duration);
			}, 0);
		}
	});
}());
