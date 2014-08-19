(function() {
	extend(bQuery.prototype, {
		getBoundingClientRectBy: function(parent) {
			var $parent = $(parent);

			var gcrChild = this[0].getBoundingClientRect(),
				gcrParent = $parent[0].getBoundingClientRect();

			return {
				left: gcrChild.left - gcrParent.left,
				top: gcrChild.top - gcrParent.top,
				width: gcrChild.width - gcrParent.width,
				height: gcrChild.height - gcrParent.height,
				right: gcrChild.right - gcrParent.right,
				bottom: gcrChild.bottom - gcrParent.bottom
			};
		}
	});
}());
