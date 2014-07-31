//#include("/View/View.js");

var EditorLineNumberView = (function() {
	function EditorLineView() {
		this.super();

		this.$base = $("<div class='EditorLineNumberView-base'></div>");
		this.$base.bind("click", this.click, this, true);
	}
	extendClass(EditorLineView, View);

	EditorLineView.prototype.activate = function() {
		this.$base.addClass("-active");
	};

	EditorLineView.prototype.deactivate = function() {
		this.$base.removeClass("-active");
	};

	EditorLineView.prototype.html = function(html) {
		return this.$base.html(html);
	};

	EditorLineView.prototype.click = function(ev) {
		this.fire("click", ev, this);
	}

	return EditorLineView;
}());
