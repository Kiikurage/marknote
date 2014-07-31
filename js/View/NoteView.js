//#include("/View/View.js");

var NoteView = (function() {

	function NoteView() {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		NoteView.prototype.__showNoteViewTextBox();
	};

	NoteView.prototype.__showNoteViewTextBox = function() {
		console.log("__showNoteViewTextBox");
	};

	return NoteView;
}());
