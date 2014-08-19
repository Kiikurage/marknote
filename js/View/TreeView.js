/*
 *	TODO:
 *
 *	updateが走りすぎている
 *	再描画タイミングの最適化
 *
 *	モデル - ビュー間の構造の簡潔化
 *
 */

//#include("/View/View.js");
//#include("/Model/TreeViewNodeViewModel.js");

var TreeView = (function() {
	function TreeView(title) {
		this.__$base = $("<div class='TreeView'></div>");

		this.rootNode = new TreeViewNodeView(title);
		this.rootNode.appendTo(this);
	};
	extendClass(TreeView, View);

	return TreeView
}());

var TreeViewNodeView = (function() {
	function TreeViewNodeView(title) {
		this.__$base = $("<li></li>");
		this.__$base.bind("click", this.__clickBase, this, true);

		this.__$title = $("<p></p>");
		this.__$title.appendTo(this.__$base);

		this.__$children = $("<ul></ul>");
		this.__$children.appendTo(this.__$base);

		this.model = new TreeViewNodeViewModel();
		this.model.bind("update", this.__updateModel, this);
		this.model.title = title;
	};
	extendClass(TreeViewNodeView, View);

	//override
	TreeViewNodeView.prototype.appendChild = function(node) {
		node.appendTo(this.__$children);
	};

	/*-------------------------------------------------
	 * append/remove node
	 */
	TreeViewNodeView.prototype.appendNode = function(title) {
		var child = new TreeViewNodeView(title);

		child.appendTo(this);
		this.model.appendChild(child.model);

		return child;
	};

	TreeViewNodeView.prototype.removeNode = function(child) {
		this.model.removeChild(child.model);
	};

	/*-------------------------------------------------
	 * Event Handlers
	 */

	TreeViewNodeView.prototype.__updateModel = function() {
		this.update();
	};

	TreeViewNodeView.prototype.__clickBase = function(ev) {
		this.fire("click", ev);
	};

	IPubSub.attachShortHandle(TreeViewNodeView.prototype, [
		"click"
	]);

	/*-------------------------------------------------
	 * update
	 */

	TreeViewNodeView.prototype.update = function() {
		this.__$title.text(this.model.title);
	};

	/*-------------------------------------------------
	 * remove
	 */

	TreeViewNodeView.prototype.remove = function() {
		this.super();
		this.__$base.unbind("click", this.__clickBase, this, true);
		this.model.unbind("update", this.__updateModel, this);
	};

	return TreeViewNodeView
}());
