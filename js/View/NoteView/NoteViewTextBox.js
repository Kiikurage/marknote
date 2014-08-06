//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Service/KeyRecognizer.js");
//#include("/Model/NoteViewTextboxModel.js");

var NoteViewTextbox = (function() {

	//static variables
	var $textarea = $("<textarea class='NoteViewTextbox-textarea'></textarea>")
		.appendTo(document.body),

		textarea = $textarea[0],

		$cursor = $("<div class='NoteViewTextbox-Cursor'></div>"),

		lastSelectionStart = -1;


	function NoteViewTextbox(model) {
		this.super();
		this.__$base = $("<div class='NoteViewTextbox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
		this.__$base.bind("mousedown", this.__mousedown, this, true);

		this.__$markdown = $("<div class='NoteViewTextbox-markdown'></div>")
		this.__$markdown.appendTo(this.__$base);

		this.__kr = new KeyRecognizer();
		this.__kr.register({
			"shift+tab": this.__inputDeleteTab,
			"tab": this.__inputTab,
			"enter": this.__inputEnter
		}, this);

		this.__dragging = {
			startX: null,
			startY: null,
			startMX: null,
			startMY: null,
		};

		this.model = model || new NoteViewTextboxModel();
		this.model.bind("update", this.update, this);

		this.update();
	}
	extendClass(NoteViewTextbox, View);


	/*-------------------------------------------------
	 * Event Handlers
	 */
	NoteViewTextbox.prototype.__click = function(ev) {
		this.setFocus();
		ev.stopPropagation();
	};

	NoteViewTextbox.prototype.__input = function(ev) {
		this.model.text = textarea.value;
	};

	NoteViewTextbox.prototype.__blurTextArea = function(ev) {
		this.lostFocus();
	};

	NoteViewTextbox.prototype.__inputTab = function(ev) {
		var val = textarea.value,
			selectionStart = textarea.selectionStart;

		textarea.value =
			val.slice(0, textarea.selectionStart) +
			"\t" +
			val.slice(textarea.selectionEnd)

		textarea.selectionStart =
			textarea.selectionEnd =
			selectionStart + 1;

		this.model.text = textarea.value;
		ev.preventDefault();
	};

	NoteViewTextbox.prototype.__inputDeleteTab = function(ev) {
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

			this.model.text = textarea.value;
		}
		ev.preventDefault();
	};

	NoteViewTextbox.prototype.__inputEnter = function(ev) {
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

		this.model.text = textarea.value;
		ev.preventDefault();
	};

	NoteViewTextbox.prototype.__mousedown = function(ev) {
		this.__$base.addClass("-drag");

		document.body.bind("mousemove", this.__mousemoveForMove, this, true);
		document.body.bind("mouseup", this.__mouseupForMove, this, true);

		this.__startMX = ev.x;
		this.__startMY = ev.y;
		this.__startX = parseInt(this.__$base.css("left"));
		this.__startY = parseInt(this.__$base.css("top"));
	};

	NoteViewTextbox.prototype.__mouseupForMove = function(ev) {
		this.__$base.removeClass("-drag");

		document.body.unbind("mousemove", this.__mousemoveForMove, this, true);
		document.body.unbind("mouseup", this.__mouseupForMove, this, true);
	};

	NoteViewTextbox.prototype.__mousemoveForMove = function(ev) {
		var x = Math.round((this.__startX + (ev.x - this.__startMX)) / GRID_SIZE) * GRID_SIZE,
			y = Math.round((this.__startY + (ev.y - this.__startMY)) / GRID_SIZE) * GRID_SIZE;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		this.model.x = x;
		this.model.y = y;
	};


	/*-------------------------------------------------
	 * remove
	 */
	NoteViewTextbox.prototype.remove = function() {
		this.fire("beforeRemove", this);

		this.__$base.remove();

		this.fire("remove", this);
	};

	/*-------------------------------------------------
	 * focus
	 */
	NoteViewTextbox.prototype.setFocus = function() {
		this.model.focus = true;

		$textarea.bind("input", this.__input, this, true);
		$textarea.bind("blur", this.__blurTextArea, this, true);

		textarea.value = this.model.text;
		$textarea.focus();

		this.__kr.listen($textarea);
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.model.focus = false;

		$textarea.unbind("input", this.__input, this, true);
		$textarea.unbind("blur", this.__blurTextArea, this, true);

		if (this.model.text === "") this.remove();
		this.__kr.unlisten($textarea);
	};

	/*-------------------------------------------------
	 * update
	 */
	NoteViewTextbox.prototype.update = function() {
		var model = this.model,
			text = model.text,
			html = Markdown.parse(text);

		this.__$base.toggleClass("-edit", model.focus);
		this.__$markdown.html(html);
		this.setPosition(model.x, model.y);

		this.fire("update", this);
	};

	return NoteViewTextbox;
}());
