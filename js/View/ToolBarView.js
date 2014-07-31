//#include("/View/View.js");

var ToolbarView = (function() {

	function ToolbarView() {
		this.super();

		this.__$base = $("<div class='ToolbarView-base'></div>");
	}
	extendClass(ToolbarView, View);

	return ToolbarView;
}());
