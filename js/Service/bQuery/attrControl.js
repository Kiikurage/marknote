(function() {
	extend(bQuery.prototype, {
		text: function(t) {
			if (t === undefined) {
				return this[0].innerText;
			}

			return this.map(function(node) {
				node.innerText = t;
			});
		},
		html: function(t) {
			if (t === undefined) {
				return this[0].innerHTML;
			}

			return this.map(function(node) {
				node.innerHTML = t;
			});
		},
		val: function(t) {
			if (t === undefined) {
				return this[0].value;
			}

			return this.map(function(node) {
				node.value = t;
			});
		},
		setAttribute: function(key, val) {
			return this.map(function(node) {
				node.setAttribute(key, val);
			});
		},
		getAttribute: function(key) {
			return this[0].getAttribute(key);
		},
		attr: function(key, val) {
			if (arguments.length === 1) {
				return this.getAttribute(key);
			} else {
				return this.setAttribute(key, val);
			}
		},
		focus: function(flag) {
			return this.map(function(node) {
				node.focus(flag);
			});
		}
	});
}());
