//#include("/Model/Model.js");

var NoteViewPageModel = (function() {

	function NoteViewPageModel() {
		this._textboxes = [];
	}
	extendClass(NoteViewPageModel, Model);

	NoteViewPageModel.__record("textboxes");

	NoteViewPageModel.prototype.appendTextbox = function(model) {
		if (this.textboxes.indexOf(model) !== -1) return;

		model.bind("update", this.__updateTextbox, this)
		this.textboxes.push(model);

		this.fire("update");
	};

	NoteViewPageModel.prototype.removeTextbox = function(model) {
		var index = this.textboxes.indexOf(model);
		if (index === -1) return;

		model.unbind("update", this.__updateTextbox, this)
		this.textboxes.splice(index, 1);

		this.fire("update");
	};

	NoteViewPageModel.prototype.__updateTextbox = function() {
		this.fire("update");
	};

	return NoteViewPageModel;
}());
