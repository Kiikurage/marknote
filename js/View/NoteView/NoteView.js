//#include("/View/View.js");
//#include("/View/NoteView/NoteViewTextBox.js");
//#include("/Model/NoteViewPageModel.js");

GRID_SIZE = 20;
var NoteView = (function() {

	function NoteView() {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.model = new NoteViewPageModel();
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		var textBox = this.__addTextBox(),
			x = Math.round(ev.offsetX / GRID_SIZE) * GRID_SIZE - 30,
			y = Math.round(ev.offsetY / GRID_SIZE) * GRID_SIZE - 50;

		this.model.appendTextBoxModel(textBox.model);
		textBox.bind("beforeRemove", this.__beforeRemoveTextBox, this);
		textBox.bind("remove", this.__removeTextBox, this)

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		textBox.setPosition(x, y);
		textBox.setFocus();
	};

	NoteView.prototype.__addTextBox = function() {
		var textBox = new NoteViewTextBox();
		textBox.appendTo(this);
		return textBox;
	};

	NoteView.prototype.__beforeRemoveTextBox = function(textBox) {
		this.model.removeTextBoxModel(textBox.model);
	};

	NoteView.prototype.__removeTextBox = function(textBox) {
		this.model.save();
	};

	return NoteView;
}());
