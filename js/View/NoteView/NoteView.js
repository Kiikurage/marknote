//#include("/View/View.js");
//#include("/View/NoteView/NoteViewTextBox.js");

GRID_SIZE = 20;
var NoteView = (function() {

	function NoteView() {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		var textBox = this.__addNoteViewTextBox(),
			x = Math.round(ev.offsetX / GRID_SIZE) * GRID_SIZE - 30,
			y = Math.round(ev.offsetY / GRID_SIZE) * GRID_SIZE - 50;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		textBox.setPosition(x, y);
		textBox.setFocus();
	};

	NoteView.prototype.__addNoteViewTextBox = function() {
		var textBox = new NoteViewTextBox();
		textBox.appendTo(this);
		return textBox;
	};

	return NoteView;
}());
