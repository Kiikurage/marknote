//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Service/KeyRecognizer.js");
//#include("/Model/NoteViewTextBoxModel.js");

var NoteViewTextBox = (function() {

	//static variables
	var $textarea = $("<textarea class='NoteViewTextBox-textarea'></textarea>")
		.appendTo(document.body),

		textarea = $textarea[0],

		$cursorBufferBase = $("<div class='NoteViewTextBox-base'></div>")
		.appendTo(document.body),

		$cursorBuffer = $("<div class='NoteViewTextBox-markdown'></div>")
		.appendTo($cursorBufferBase),

		$cursor = $("<div class='NoteViewTextBox-Cursor'></div>"),

		lastSelectionStart = -1;


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

		this.model = new NoteViewTextBoxModel();
		this.model.bind("update", this.update, this);
		this.__updateTimerID = null;
	}
	extendClass(NoteViewTextBox, View);


	/*-------------------------------------------------
	 * Event Handlers
	 */
	NoteViewTextBox.prototype.__click = function(ev) {
		this.setFocus();
		ev.stopPropagation();
	};

	NoteViewTextBox.prototype.__input = function(ev) {
		this.model.val(textarea.value);
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

		this.model.val(textarea.value);
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

			this.model.val(textarea.value);
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

		this.model.val(textarea.value);
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

		this.model.pos(
			parseInt(this.__$base.css("top")),
			parseInt(this.__$base.css("left"))
		)
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


	/*-------------------------------------------------
	 * methods
	 */
	NoteViewTextBox.prototype.remove = function() {
		this.fire("beforeRemove", this);

		this.__$base.remove();

		this.fire("remove", this);
	};

	NoteViewTextBox.prototype.setFocus = function() {
		this.__$base.addClass("-edit");
		$textarea.bind("input", this.__input, this, true);
		$textarea.bind("blur", this.__blurTextArea, this, true);
		$textarea.val(this.model.val());
		$textarea.focus();
		this.__kr.listen($textarea);

		if (this.__updateTimerID === null) {
			var that = this;
			this.__updateTimerID = setInterval(function() {
				that.fire("__cursorUpdate");
			}, 50);
		}

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
		this.model.val(textarea.value);

		if (this.model.val() === "") this.remove();
	};

	NoteViewTextBox.prototype.update = function() {
		var html = Markdown.parse(this.model.val());

		this.__$markdown.html(html);

		this.fire("update", this);
	};

	NoteViewTextBox.prototype.updateCursor = function() {

	};

	return NoteViewTextBox;
}());
