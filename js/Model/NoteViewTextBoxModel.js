//#include("/Model/Model.js");

var NoteViewTextboxModel = (function() {
	function NoteViewTextboxModel() {
		this._text = "";
		this.__receiver = null;
		this._w = 300;
		this._z = 0;
	}
	extendClass(NoteViewTextboxModel, Model);

	NoteViewTextboxModel.__record("x");
	NoteViewTextboxModel.__record("y");
	NoteViewTextboxModel.__record("z");
	NoteViewTextboxModel.__record("w");
	NoteViewTextboxModel.__record("text");
	NoteViewTextboxModel.__record("focus");

	NoteViewTextboxModel.prototype.__receiverInput = function() {
		this.text = this.__receiver.getValue();
	};

	return NoteViewTextboxModel;
}());
