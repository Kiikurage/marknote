//#include("/Model/Model.js");

var NoteViewTextboxModel = (function() {
	function NoteViewTextboxModel() {
		this._text = "";
	}
	extendClass(NoteViewTextboxModel, Model);

	NoteViewTextboxModel.__record("x");
	NoteViewTextboxModel.__record("y");
	NoteViewTextboxModel.__record("text");

	return NoteViewTextboxModel;
}());
