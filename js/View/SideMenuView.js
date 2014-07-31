//#include("/View/View.js");

var SideMenuView = (function() {

	function SideMenuView() {
		this.super();

		this.$base = $("<div class='SideMenuView-base'></div>");

	}
	extendClass(SideMenuView, View);

	return SideMenuView;
}());
