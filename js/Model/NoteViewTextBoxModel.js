//#include("/Model/Model.js");

var NoteViewTextboxModel = (function() {
	function NoteViewTextboxModel() {
		this._text = "";
		this.__receiver = null;
	}
	extendClass(NoteViewTextboxModel, Model);

	NoteViewTextboxModel.__record("x");
	NoteViewTextboxModel.__record("y");
	NoteViewTextboxModel.__record("text");
	NoteViewTextboxModel.__record("focus");

	NoteViewTextboxModel.prototype.__receiverInput = function() {
		this.text = this.__receiver.getValue();
	};

	return NoteViewTextboxModel;
}());
