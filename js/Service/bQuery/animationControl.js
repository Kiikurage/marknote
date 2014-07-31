(function() {
	extend(bQuery.prototype, {
		animate: function(fn, duration) {

			var that = this,
				core = function() {
					var n = +(new Date()),
						x = (n - s > duration) ? 1 : (n - s) / duration;

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
}());
