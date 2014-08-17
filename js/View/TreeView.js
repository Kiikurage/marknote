//#include("/View/View.js");
//#include("/Model/TreeViewNodeViewModel.js");

var TreeView = (function() {
	function TreeView(root) {
		this.__$base = $("<div class='TreeView'></div>");
		root.view.appendTo(this);
	};
	extendClass(TreeView, View);

	return TreeView
}());

var TreeViewNodeView = (function() {
	function TreeViewNodeView(model) {
		this.__$base = $("<li></li>");
		model.bind("update", this.__updateModel, this);
	};
	extendClass(TreeViewNodeView, View);

	TreeViewNodeView.prototype.__updateModel = function(model) {
		this.update(model);
	};

	TreeViewNodeView.prototype.update = function(model) {
		console.log("update: " + model.data);
		var $mainContent = this.delegateUpdateMainContent(model),
			$childContent = this.delegateUpdateChildContent(model),
			$totalContent = this.delegateUpdateTotalContent($mainContent, $childContent);
	};

	TreeViewNodeView.prototype.delegateUpdateMainContent = function(model) {
		return $("<p>" + model.data + "</p>");
	};

	TreeViewNodeView.prototype.delegateUpdateChildContent = function(model) {
		var children = model.children;

		if (!children.length) return $();

		var $container = $("<ul></ul>");

		for (var i = 0, max = children.length; i < max; i++) {
			children[i].update();
			children[i].view.appendTo($container);
		}

		return $container;
	};

	TreeViewNodeView.prototype.delegateUpdateTotalContent = function($mainContent, $childContent) {
		this.__$base.children().remove();
		this.__$base.append($mainContent);
		this.__$base.append($childContent);
	};

	return TreeViewNodeView
}());
