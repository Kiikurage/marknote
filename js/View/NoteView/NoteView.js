//#include("/View/View.js");
//#include("/View/NoteView/NoteViewTextbox.js");
//#include("/View/NoteView/NoteViewCursorView.js");
//#include("/Model/NoteViewPageModel.js");

GRID_SIZE = 20;
var NoteView = (function() {

	function NoteView(model) {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.cursor = new NoteViewCursorView();
	}
	extendClass(NoteView, View);

	NoteView.prototype.bindModel = function(model) {
		this.__$base.children().remove();

		this.model = model;
		model.view = this;

		this.model.bind("update", this.update, this);

		var models = model.textboxes;
		for (var i = 0, max = models.length; i < max; i++) {
			this.__addTextbox(models[i]);
		}

		this.update();
	};

	NoteView.prototype.__click = function(ev) {
		var textbox = this.__addTextbox(),
			x = Math.round(ev.offsetX / GRID_SIZE) * GRID_SIZE - 30,
			y = Math.round(ev.offsetY / GRID_SIZE) * GRID_SIZE - 50;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		textbox.model.x = x;
		textbox.model.y = y;
		textbox.setFocus();
	};

	NoteView.prototype.__addTextbox = function(model) {
		var model = model || new NoteViewTextboxModel(),
			textbox = new NoteViewTextbox(this.cursor);

		textbox.bindModel(model);
		textbox.appendTo(this);
		this.model.appendTextbox(model);

		textbox.bind("remove", this.__removeTextbox, this);

		return textbox;
	};

	NoteView.prototype.__removeTextbox = function(textbox) {
		this.model.removeTextbox(textbox.model);
	};

	NoteView.prototype.update = function() {
		this.fire("update");
	};

	return NoteView;
}());
