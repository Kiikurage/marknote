//#include("/Interface/IPubSub.js");
//#include("/Service/KeyRecognizer.js");

var NoteViewInputReceiver = (function() {

	function NoteViewInputReceiver() {
		this.__$base = $("<textarea class='NoteViewInputReceiver-base'></textarea>");
		this.__$base.appendTo(document.body);
		this.__$base.bind("input", this.__input, this, true);
		this.__$base.bind("blur", this.__blurTextArea, this, true);

		this.__kr = new KeyRecognizer();
		this.__kr.register({
			"shift+tab": this.__inputDeleteTab,
			"tab": this.__inputTab,
			"enter": this.__inputEnter,
			"left": this.__inputSelectionLeft,
			"right": this.__inputSelectionRight,
			"up": this.__inputSelectionUp,
			"down": this.__inputSelectionDown,

			"shift+up": this.__inputSelectionMove,
			"shift+down": this.__inputSelectionMove,
			"shift+left": this.__inputSelectionMove,
			"shift+right": this.__inputSelectionMove,
			"cmd+up": this.__inputSelectionMove,
			"cmd+down": this.__inputSelectionMove,
			"cmd+left": this.__inputSelectionMove,
			"cmd+right": this.__inputSelectionMove
		}, this);
		this.__kr.listen(this.__$base);

		this.selectionStart = 0;
		this.selectionEnd = 0;
	}
	IPubSub.implement(NoteViewInputReceiver.prototype);

	NoteViewInputReceiver.prototype.__input = function(ev) {
		this.syncSelectionRange();
		this.fire("input");
	};

	NoteViewInputReceiver.prototype.__inputTab = function(ev) {
		var val = this.getValue();

		this.setValue(
			val.slice(0, this.selectionStart) +
			"\t" +
			val.slice(this.selectionEnd)
		)

		this.syncSelectionRange(this.selectionStart + 1, this.selectionStart + 1);
		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputDeleteTab = function(ev) {
		var val = this.getValue();

		var lastLine = val.slice(0, this.selectionStart).split("\n").pop(),
			len = lastLine.length,
			indentLevel = lastLine.match(/^\t*/)[0].length;

		if (indentLevel > 0) {
			this.setValue(
				val.slice(0, this.selectionStart - len) +
				lastLine.slice(1) +
				val.slice(this.selectionEnd)
			);

			this.syncSelectionRange(this.selectionStart - 1, this.selectionStart - 1);
			this.fire("input");
		}
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputEnter = function(ev) {
		var val = this.getValue();

		var lastLine = val.slice(0, this.selectionStart).split("\n").pop(),
			indentLevel = lastLine.match(/^\t*/)[0].length;

		this.setValue(
			val.slice(0, this.selectionStart) +
			"\n" + Array(indentLevel + 1).join("\t") +
			val.slice(this.selectionEnd)
		)

		this.syncSelectionRange(this.selectionStart + 1 + indentLevel, this.selectionStart + 1 + indentLevel);
		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionMove = function(ev) {
		this.syncSelectionRange();
		this.fire("input");
		// ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionRight = function(ev) {
		this.syncSelectionRange();
		if (this.selectionStart < this.__$base[0].value.length) {
			this.selectionStart++;
			this.selectionEnd++;
		}
		this.fire("input");
		// ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionLeft = function(ev) {
		this.syncSelectionRange();
		if (this.selectionStart > 0) {
			this.selectionStart--;
			this.selectionEnd--;
		}
		this.fire("input");
		// ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionDown = function(ev) {
		this.syncSelectionRange();
		if (this.selectionStart < this.__$base[0].value.length) {
			this.selectionStart++;
			this.selectionEnd++;
		}
		this.fire("input");
		// ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionUp = function(ev) {
		this.syncSelectionRange();
		if (this.selectionStart > 0) {
			this.selectionStart--;
			this.selectionEnd--;
		}
		this.fire("input");
		// ev.preventDefault();
	};


	NoteViewInputReceiver.prototype.__blurTextArea = function(ev) {
		this.lostFocus();
	};

	/*-------------------------------------------------
	 * value
	 */
	NoteViewInputReceiver.prototype.getValue = function() {
		return this.__$base.val();
	};
	NoteViewInputReceiver.prototype.setValue = function(val) {
		return this.__$base.val(val);
	};

	/*-------------------------------------------------
	 * focus
	 */
	NoteViewInputReceiver.prototype.setFocus = function() {
		this.syncSelectionRange();
		this.fire("focus");
		this.__$base.focus(true);
	};

	NoteViewInputReceiver.prototype.lostFocus = function() {
		this.fire("blur");
	};

	/*-------------------------------------------------
	 * Selection Range
	 */
	NoteViewInputReceiver.prototype.syncSelectionRange = function(start, end) {
		if (start !== undefined) {
			this.__$base[0].selectionStart = start;
		}
		if (end !== undefined) {
			this.__$base[0].selectionEnd = end;
		}

		this.selectionStart = this.__$base[0].selectionStart;
		this.selectionEnd = this.__$base[0].selectionEnd;
	};

	return NoteViewInputReceiver;
}());
