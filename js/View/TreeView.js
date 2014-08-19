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
		this.__$base = $("<div class='TreeView-base'></div>");

		this.rootNode = new TreeViewNodeView(title);
		this.rootNode.appendTo(this);
		this.rootNode.treeView = this;
	};
	extendClass(TreeView, View);

	IPubSub.attachShortHandle(TreeView.prototype, [
		"click"
	]);

	return TreeView
}());

var TreeViewNodeView = (function() {
	function TreeViewNodeView(title) {
		this.treeView = null;

		this.__$base = $("<li class='TreeViewNodeView-base -open'></li>");
		this.__$base.bind("click", this.__clickBase, this, true);

		this.__$title = $("<p class='TreeViewNodeView-title'></p>");
		this.__$title.appendTo(this.__$base);

		this.__$titleIcon = $("<i class='TreeViewNodeView-title-icon'></i>");
		this.__$titleIcon.appendTo(this.__$title);

		this.__$titleText = $("<span class='TreeViewNodeView-title-text'></span>");
		this.__$titleText.appendTo(this.__$title);

		this.__$children = $("<ul class='TreeViewNodeView-children'></ul>");
		this.__$children.appendTo(this.__$base);

		this.model = new TreeViewNodeViewModel();
		this.model.bind("update", this.__updateModel, this);
		this.model.bind("updateTree", this.__updateTreeModel, this);
		this.model.title = title;

		this.__isOpen = true;
		this.__originalHeight = null;
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
		child.treeView = this.treeView;
		this.model.appendChild(child.model);

		return child;
	};

	TreeViewNodeView.prototype.removeNode = function(child) {
		this.model.removeChild(child.model);
		child.treeView = null;
		child.remove();
	};

	/*-------------------------------------------------
	 * Event Handlers
	 */

	TreeViewNodeView.prototype.__updateModel = function() {
		this.update();
	};

	TreeViewNodeView.prototype.__updateTreeModel = function() {
		this.__$base.toggleClass("-hasChild", this.model.children.length > 0);
	};

	TreeViewNodeView.prototype.__clickBase = function(ev) {
		this.fire("click", ev);
		if (this.treeView) this.treeView.fire("click", this);

		this.toggle();

		ev.stopPropagation();
	};

	IPubSub.attachShortHandle(TreeViewNodeView.prototype, [
		"click"
	]);

	/*-------------------------------------------------
	 * open / close
	 */

	TreeViewNodeView.prototype.toggle = function() {
		if (this.__isOpen) {
			this.close();
		} else {
			this.open();
		}
	};

	TreeViewNodeView.prototype.open = function() {
		this.__$children.slideDown();
		this.__$children.fadeIn();
		this.__$base.addClass("-open");
		this.__$base.removeClass("-close");

		this.__isOpen = true;
	};

	TreeViewNodeView.prototype.close = function() {
		this.__$children.slideUp();
		this.__$children.fadeOut();
		this.__$base.removeClass("-open");
		this.__$base.addClass("-close");

		this.__isOpen = false;
	};

	/*-------------------------------------------------
	 * update
	 */

	TreeViewNodeView.prototype.update = function() {
		this.__$titleText.text(this.model.title);
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
