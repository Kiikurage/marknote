//#include("/Model/Model.js");

var NoteViewPageModel = (function() {

	function NoteViewPageModel() {
		this._textboxes = [];
	}
	extendClass(NoteViewPageModel, Model);

	NoteViewPageModel.__record("textboxes");

	NoteViewPageModel.prototype.appendTextbox = function(model) {
		if (this.textboxes.indexOf(model) === -1) {
			this.textboxes.push(model);
		}

		model.bind("update", this.update, this);

		this.fire("update");
	};

	NoteViewPageModel.prototype.removeTextbox = function(model) {
		var index = this.textboxes.indexOf(model);
		if (index === -1) return;
		this.textboxes.splice(index, 1);

		model.unbind("update", this.update, this)

		this.fire("update");
	};

	NoteViewPageModel.prototype.update = function() {
		this.fire("update");
	};

	return NoteViewPageModel;
}());
