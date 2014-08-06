var NoteViewPageModel = (function() {

	function NoteViewPageModel() {
		this.__textBoxModelList = [];
	}
	IPubSub.implement(NoteViewPageModel.prototype)

	NoteViewPageModel.prototype.appendTextBoxModel = function(model) {
		this.__textBoxModelList.push(model);
	};

	NoteViewPageModel.prototype.removeTextBoxModel = function(model) {
		var index = this.__textBoxModelList.indexOf(model);

		this.__textBoxModelList.splice(index, 1);
	};

	NoteViewPageModel.prototype.save = function() {
		var data = this.parseToNativeObject();

		localStorage.setItem("NoteViewPageModel", JSON.stringify(data));
	};

	NoteViewPageModel.prototype.parseToNativeObject = function() {
		var list = this.__textBoxModelList,
			data = [];

		for (var i = 0, max = list.length; i < max; i++) {
			var model = list[i];
			data.push(model.parseToNativeObject());
		}

		return data;
	};

	return NoteViewPageModel;
}());
