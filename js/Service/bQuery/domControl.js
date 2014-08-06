(function() {
	extend(bQuery.prototype, {
		append: function(children) {
			return this.appendChild(children);
		},
		appendChild: function(children) {
			var that = this;
			$(children).map(function(child) {
				that[0].appendChild(child);
			});
			return this;
		},
		appendTo: function(parent) {
			$(parent).appendChild(this);
			return this;
		},
		insertBefore: function(refElement) {
			var refElement = $(refElement)[0],
				parent = refElement.parentNode;

			this.map(function(child) {
				parent.insertBefore(child, refElement);
			});

			return this;
		},
		insertAfter: function(refElement) {
			var refElement = $(refElement);

			this.insertBefore(refElement);
			refElement[0].parentNode.insertBefore(refElement[0], this[0]);

			return this;
		},
		remove: function() {
			this.map(function(child) {
				if (!child.parentNode) return;
				child.parentNode.removeChild(child);
			});
			return this;
		},
		parent: function() {
			return $(this[0].parentNode);
		},
		children: function() {
			return $().merge(this[0].children);
		}
	});
}());
