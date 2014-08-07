//#include("/View/View.js");

var AlertView = (function() {

	function AlertView() {
		this.super();

		this.__$base = $("<div class='AlertView-base'></div>");

		this.__$text = $("<span class='AlertView-text'></span>");
		this.__$text.appendTo(this.__$base)
	}
	extendClass(AlertView, View);

	AlertView.prototype.show = function(text, duration) {
		this.__$text.text(text);
		this.__$base.addClass("-show");

		var that = this;
		setTimeout(function() {
			that.hide()
		}, duration || 3000);
	};

	AlertView.prototype.showError = function(text, duration) {
		this.__$base.addClass("-error");
		this.show(text, duration);
	};

	AlertView.prototype.hide = function(text) {
		this.__$base.removeClass("-show");
		this.__$base.removeClass("-error");
	};

	return AlertView;
}());
