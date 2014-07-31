//#include("/View/View.js");

var NoteView = (function() {

	function NoteView() {
		this.super();
		this.$base = $("<div class='NoteView-base'></div>");

		this.$base.bind("click", this.__baseClick, this, true);

	}
	extendClass(NoteView, View);

	NoteView.prototype.__baseClick = function(ev) {
		NoteView.prototype.__showNoteViewTextBox();
	};

	NoteView.prototype.__showNoteViewTextBox = function() {
		console.log("__showNoteViewTextBox");
	};

	return NoteView;
}());
