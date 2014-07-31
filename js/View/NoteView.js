//#include("/View/View.js");

var NoteView = (function() {

	function NoteView() {
		this.super();

		this.__$base = $("<div class='NoteView-base'></div>");

	}
	extendClass(NoteView, View);

	return NoteView;
}());
