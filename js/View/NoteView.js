//#include("/View/View.js");
//#include("/Service/Markdown.js");

var NoteView = (function() {

	function NoteView() {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		var textBox = this.__addNoteViewTextBox(),
			x = Math.round(ev.offsetX / 10) * 10,
			y = Math.round(ev.offsetY / 10) * 10;

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

var NoteViewTextBox = (function() {

	function NoteViewTextBox() {
		this.super();
		this.__$base = $("<div class='NoteViewTextBox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.__$header = $("<header class='NoteViewTextBox-header'></header>")
		this.__$header.appendTo(this.__$base);

		this.__$textarea = $("<textarea class='NoteViewTextBox-textarea'></textarea>")
		this.__$textarea.appendTo(this.__$base);
		this.__$textarea.bind("input", this.__input, this, true);
		this.__$textarea.bind("blur", this.__blurTextArea, this, true);

		this.__$markdown = $("<div class='NoteViewTextBox-markdown'></textarea>")
		this.__$markdown.appendTo(this.__$base);
	}
	extendClass(NoteViewTextBox, View);

	NoteViewTextBox.prototype.__click = function(ev) {
		this.setFocus();
		ev.stopPropagation();
	};

	NoteViewTextBox.prototype.__input = function(ev) {
		this.update();
	};

	NoteViewTextBox.prototype.__blurTextArea = function(ev) {
		if (this.__$textarea.val() === "") {
			this.remove();
		}

		this.__$base.removeClass("-edit");
		this.update();
	};

	NoteViewTextBox.prototype.remove = function() {
		this.__$base.remove();
		this.fire("remove", this);
	};

	NoteViewTextBox.prototype.setFocus = function() {
		this.__$base.addClass("-edit");
		this.__$textarea.focus();
		this.update();
	};

	NoteViewTextBox.prototype.update = function() {
		this.__$base.toggleClass("-focus",
			this.__$textarea.val() !== "" &&
			document.activeElement === this.__$textarea[0]);

		var html = Markdown.parse(this.__$textarea.val());

		this.__$markdown.html(html);
	};

	return NoteViewTextBox;
}());
