//#include("/View/View.js");

var NoteView = (function() {

	function NoteView() {
		this.super();

		this.$base = $("<div class='NoteView-base'></div>");

	}
	extendClass(NoteView, View);

	return NoteView;
}());
