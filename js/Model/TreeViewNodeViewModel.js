//#include("/Model/Model.js");

var TreeViewNodeViewModel = (function() {
	function TreeViewNodeViewModel() {
		this.children = [];
		this.parent = null;
	}
	extendClass(TreeViewNodeViewModel, Model);
	IPubSub.implement(TreeViewNodeViewModel.prototype);

	TreeViewNodeViewModel.__record("title");

	TreeViewNodeViewModel.prototype.appendChild = function(child) {
		if (this.children.indexOf(child) !== -1) return
		if (child.parent) child.parent.removeChild(child);

		this.children.push(child);
		child.parent = this;

		this.fire("updateTree", this);
		child.fire("updateTree", this);
	};

	TreeViewNodeViewModel.prototype.removeChild = function(child) {
		var index = this.children.indexOf(child);
		if (index === -1) return

		this.children.splice(index, 1);
		child.parent = null;

		this.fire("updateTree", this);
		child.fire("updateTree", this);
	};

	return TreeViewNodeViewModel;
}());
