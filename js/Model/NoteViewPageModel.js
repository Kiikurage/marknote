//#include("/Model/Model.js");

var NoteViewPageModel = (function() {

	function NoteViewPageModel() {
		this._textBoxes = [];
	}
	extendClass(NoteViewPageModel, Model);

	NoteViewPageModel.__record("textBoxes");

	NoteViewPageModel.prototype.appendTextBox = function(model) {
		this._textBoxes.push(model);
	};

	NoteViewPageModel.prototype.removeTextBox = function(model) {
		var index = this._textBoxes.indexOf(model);

		this._textBoxes.splice(index, 1);
	};

	return NoteViewPageModel;
}());
