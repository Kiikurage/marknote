//#include("/Interface/IPubSub.js");
//#include("/Service/KeyRecognizer.js");

var NoteViewInputReceiver = (function() {

	function NoteViewInputReceiver() {
		this.__$textarea = $("<textarea class='NoteViewTextbox-textarea'></textarea>");
		this.__$textarea.appendTo(document.body);
		this.__$textarea.bind("input", this.__input, this, true);
		this.__$textarea.bind("blur", this.__blurTextArea, this, true);

		this.__kr = new KeyRecognizer();
		this.__kr.register({
			"shift+tab": this.__inputDeleteTab,
			"tab": this.__inputTab,
			"enter": this.__inputEnter
		}, this);
	}
	IPubSub.implement(NoteViewInputReceiver.prototype);

	NoteViewInputReceiver.prototype.__input = function(ev) {
		this.fire("input");
	};

	NoteViewInputReceiver.prototype.__inputTab = function(ev) {
		var val = textarea.value,
			selectionStart = textarea.selectionStart;

		textarea.value =
			val.slice(0, textarea.selectionStart) +
			"\t" +
			val.slice(textarea.selectionEnd)

		textarea.selectionStart =
			textarea.selectionEnd =
			selectionStart + 1;

		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputDeleteTab = function(ev) {
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

			this.fire("input");
		}
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputEnter = function(ev) {
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

		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__blurTextArea = function(ev) {
		this.lostFocus();
	};

	/*-------------------------------------------------
	 * value
	 */
	NoteViewInputReceiver.prototype.getValue = function() {
		return this.__$textarea.val();
	};
	NoteViewInputReceiver.prototype.setValue = function(val) {
		return this.__$textarea.val(val);
	};

	/*-------------------------------------------------
	 * focus
	 */

	NoteViewInputReceiver.prototype.setFocus = function() {
		this.fire("focus");
		this.__$textarea.focus(true);
	};

	NoteViewInputReceiver.prototype.lostFocus = function() {
		this.fire("blur");
	};

	return NoteViewInputReceiver;
}());
