//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Service/KeyRecognizer.js");

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

var NoteViewTextBox = (function() {

	var $textarea = $("<textarea class='NoteViewTextBox-textarea'></textarea>")
	$textarea.appendTo(document.body);
	var textarea = $textarea[0];

	var $cursorBufferBase = $("<div class='NoteViewTextBox-base'></div>"),
		$cursorBuffer = $("<div class='NoteViewTextBox-markdown'></div>");

	$cursorBufferBase.appendChild($cursorBuffer);
	$cursorBufferBase.appendTo(document.body);

	var lastSelectionStart = -1;

	var $cursor = $("<div class='NoteViewTextBox-Cursor'></div>");

	function NoteViewTextBox() {
		this.super();
		this.__$base = $("<div class='NoteViewTextBox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
		this.__$base.bind("mousedown", this.__mousedown, this, true);

		this.__$markdown = $("<div class='NoteViewTextBox-markdown'></div>")
		this.__$markdown.appendTo(this.__$base);

		this.bind("__cursorUpdate", this.updateCursor, this);

		this.__kr = new KeyRecognizer();
		this.__kr.register({
			"shift+tab": this.__inputDeleteTab,
			"tab": this.__inputTab,
			"enter": this.__inputEnter,
		}, this);

		this.__dragging = {
			startX: null,
			startY: null,
			startMX: null,
			startMY: null,
		};

		this.value = "";
		this.__updateTimerID = null;
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
		this.lostFocus();
	};

	NoteViewTextBox.prototype.__inputTab = function(ev) {
		var val = textarea.value,
			selectionStart = textarea.selectionStart;

		textarea.value =
			val.slice(0, textarea.selectionStart) +
			"\t" +
			val.slice(textarea.selectionEnd)

		textarea.selectionStart =
			textarea.selectionEnd =
			selectionStart + 1;

		this.update();
		ev.preventDefault();
	};

	NoteViewTextBox.prototype.__inputDeleteTab = function(ev) {
		var val = textarea.value,
			selectionStart = textarea.selectionStart;

		var lastLine = val.slice(0, textarea.selectionStart).split("\n").pop(),
			len = lastLine.length,
			indentLevel = lastLine.match(/^\t*/)[0].length;

		if (indentLevel > 0) {
			textarea.value =
				val.slice(0, textarea.selectionStart - len) +
				lastLine.slice(1) +
				val.slice(textarea.selectionEnd)

			textarea.selectionStart =
				textarea.selectionEnd =
				selectionStart - 1;

			this.update();
		}
		ev.preventDefault();
	};

	NoteViewTextBox.prototype.__inputEnter = function(ev) {
		var val = textarea.value,
			selectionStart = textarea.selectionStart;

		var lastLine = val.slice(0, textarea.selectionStart).split("\n").pop(),
			indentLevel = lastLine.match(/^\t*/)[0].length;

		textarea.value =
			val.slice(0, textarea.selectionStart) +
			"\n" + Array(indentLevel + 1).join("\t") +
			val.slice(textarea.selectionEnd)

		textarea.selectionStart =
			textarea.selectionEnd =
			selectionStart + 1 + indentLevel;

		this.update();
		ev.preventDefault();
	};



	NoteViewTextBox.prototype.__mousedown = function(ev) {
		this.__$base.addClass("-drag");

		document.body.bind("mousemove", this.__mousemoveForMove, this, true);
		document.body.bind("mouseup", this.__mouseupForMove, this, true);

		this.__startMX = ev.x;
		this.__startMY = ev.y;
		this.__startX = parseInt(this.__$base.css("left"));
		this.__startY = parseInt(this.__$base.css("top"));
	};

	NoteViewTextBox.prototype.__mouseupForMove = function(ev) {
		this.__$base.removeClass("-drag");

		document.body.unbind("mousemove", this.__mousemoveForMove, this, true);
		document.body.unbind("mouseup", this.__mouseupForMove, this, true);
	};

	NoteViewTextBox.prototype.__mousemoveForMove = function(ev) {
		var left = Math.round((this.__startX + (ev.x - this.__startMX)) / GRID_SIZE) * GRID_SIZE,
			top = Math.round((this.__startY + (ev.y - this.__startMY)) / GRID_SIZE) * GRID_SIZE;

		if (left < 0) left = 0;
		if (top < 0) top = 0;


		this.__$base.css({
			left: left,
			top: top
		});
	};

	NoteViewTextBox.prototype.remove = function() {
		this.__$base.remove();
		this.fire("remove", this);
	};

	NoteViewTextBox.prototype.setFocus = function() {
		this.__$base.addClass("-edit");
		$textarea.bind("input", this.__input, this, true);
		$textarea.bind("blur", this.__blurTextArea, this, true);
		$textarea.val(this.value);
		$textarea.focus();
		this.__kr.listen($textarea);

		if (this.__updateTimerID === null) {
			var that = this;
			this.__updateTimerID = setInterval(function() {
				that.fire("__cursorUpdate");
			}, 50);
		}

		this.update();

		$cursorBufferBase.css({
			top: 0,
			left: 0
		});
	};

	NoteViewTextBox.prototype.lostFocus = function() {
		this.__$base.removeClass("-edit");
		$textarea.unbind("input", this.__input, this, true);
		$textarea.unbind("blur", this.__blurTextArea, this, true);
		this.__kr.unlisten($textarea);

		clearInterval(this.__updateTimerID);
		this.__updateTimerID = null;
		this.value = $textarea.val();

		if (this.value === "") this.remove();

		this.update();
	};

	NoteViewTextBox.prototype.update = function() {
		var html = Markdown.parse(textarea.value);

		this.__$markdown.html(html);
	};

	NoteViewTextBox.prototype.updateCursor = function() {

	};

	return NoteViewTextBox;
}());
