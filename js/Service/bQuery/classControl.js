(function() {
	extend(bQuery.prototype, {
		addClass: function(klass) {
			this.map(function(node) {
				node.classList.add(klass);
			});
			return this
		},
		removeClass: function(klass) {
			this.map(function(node) {
				node.classList.remove(klass);
			});
			return this
		},
		toggleClass: function(klass, flag) {
			if (arguments.length == 2) {
				if (typeof flag === "boolean") {
					if (flag) {
						return this.addClass(klass)
					} else {
						return this.removeClass(klass)
					}
				} else {
					this.map(function(node) {
						if (node.classList.contains(klass)) {
							node.classList.remove(klass);
							node.classList.add(flag);
						} else {
							node.classList.add(klass);
							node.classList.remove(flag);
						}
					});
				}
			} else {
				this.map(function(node) {
					node.classList.toggle(klass);
				});
			}
			return this
		},
		hasClass: function(klass) {
			return this[0].classList.contains(klass);
		}
	});
}());
