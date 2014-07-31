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
		toggleClass: function(klass) {
			this.map(function(node) {
				node.classList.toggle(klass);
			});
			return this
		},
		hasClass: function(klass) {
			return this[0].classList.contains(klass);
		}
	});
}());
