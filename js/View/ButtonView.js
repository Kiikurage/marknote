//#include("/View/View.js");

var ButtonView = (function(){

	function ButtonView(title) {
		this.super();

		this.$base = $("<button class='ButtonView-base'>"+title+"</button>");
		this.$base.bind("click", this.click, this, true);
	}
	extendClass(ButtonView, View);

	ButtonView.prototype.click = function(ev) {
		this.fire("click", ev, this);
	};

	return ButtonView;
}());
