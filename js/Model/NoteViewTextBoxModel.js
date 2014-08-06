//#include("/Model/Model.js");

var NoteViewTextBoxModel = (function() {
	function NoteViewTextBoxModel() {
		this._position = {
			top: 0,
			left: 0,
		};
		this._text = "";
	}
	extendClass(NoteViewTextBoxModel, Model);

	NoteViewTextBoxModel.__record("position");
	NoteViewTextBoxModel.__record("text");

	NoteViewTextBoxModel.prototype.setPos = function(top, left) {
		this.__position = {
			top: top,
			left: left
		};
		this.fire("updatePosition", this, this.getPos());
	};

	return NoteViewTextBoxModel;
}());
