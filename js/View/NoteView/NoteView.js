//#include("/View/View.js");
//#include("/View/NoteView/NoteViewTextbox.js");
//#include("/Model/NoteViewPageModel.js");

GRID_SIZE = 20;
var NoteView = (function() {

	function NoteView(model) {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.model = model || new NoteViewPageModel();
		this.model.bind("update", this.update, this);

		this.update();
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		var textbox = this.__addTextbox(),
			x = Math.round(ev.offsetX / GRID_SIZE) * GRID_SIZE - 30,
			y = Math.round(ev.offsetY / GRID_SIZE) * GRID_SIZE - 50;

		textbox.bind("beforeRemove", this.__beforeRemoveTextbox, this);

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		textbox.model.x = x;
		textbox.model.y = y;
		textbox.setFocus();
	};

	NoteView.prototype.__addTextbox = function(model) {
		var textbox = new NoteViewTextbox(model);
		textbox.appendTo(this);
		this.model.appendTextbox(textbox.model);

		return textbox;
	};

	NoteView.prototype.__beforeRemoveTextbox = function(textbox) {
		this.model.removeTextbox(textbox.model);
	};

	NoteView.prototype.update = function() {
		this.model.save("test");
	};

	return NoteView;
}());
