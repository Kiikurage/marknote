//#include("/Model/Model.js");
//#include("/View/TreeView.js");

var TreeViewNodeViewModel = (function() {
	function TreeViewNodeViewModel() {
		this.children = [];
		this.parent = null;
		this.data = null;
		this.view = new TreeViewNodeView(this);
	}
	IPubSub.implement(TreeViewNodeViewModel.prototype);

	TreeViewNodeViewModel.prototype.appendChild = function(child) {
		if (this.children.indexOf(child) !== -1) return
		if (child.parent) chld.parent.removeChild(child);

		this.children.push(child);
		child.parent = child;

		this.update();
		child.update();
	};

	TreeViewNodeViewModel.prototype.removeChild = function(child) {
		var index = this.children.indexOf(child);
		if (index === -1) return

		this.children.splice(index, 1);
		child.parent = null;

		this.update();
	};

	TreeViewNodeViewModel.prototype.update = function() {
		this.fire("update", this);
	}

	return TreeViewNodeViewModel;
}());
