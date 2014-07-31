//#include("/View/View.js");
//#include("/Service/KeyRecognizer.js");
//#include("/View/EditorView/EditorViewSyntaxParser.js");

var SELECTION_DIR = {
	FRONT: 0,
	BACK: 1,
	NOSELECT: 2
};

var EDIT_STATE = {
	PENDING: 0,
	DECIDED: 1
};

var EditorView = (function() {

	function EditorView() {
		this.super();

		this.$lines = $();
		this.$lineNumbers = $();
		this.isMultiByteEdit = false;
		this.editRange = null
		this.cursorBlinkTimerID = null;
		this.isCursorHide = true;

		this.doc = new EditorDocumentModel();
		this.doc.text = document.body.outerHTML;
		this.doc.bind("change", this.update, this);
		this.doc.bind("cursormove", this.setCursorPosition, this);

		this.$base = $("<div class='EditorView-base'></div>")
			.bind("click", this.clickBase, this, true);

		this.$lineNumberArea = $("<div class='EditorView-lineNumberArea'></div>")
			.appendTo(this.$base);

		this.$lineArea = $("<div class='EditorView-lineArea'></div>")
			.appendTo(this.$base);

		this.$cursor = $("<div style='display: none' class='EditorView-cursor'></div>")
			.appendTo(this.$lineArea);

		this.$dummyLine = $("<div class='EditorView-line -dummy'></div>")
			.appendTo(this.$lineArea);

		this.$editRange = $("<div display='none' class='EditorView-editRange'></div>")
			.appendTo(this.$lineArea);

		this.$selectionRange = $("<div display='none' class='EditorView-selectionRange'></div>")
			.appendTo(this.$lineArea);

		this.$keyReceiver = $("<textarea class='EditorView-keyReceiver'></textarea>");
		this.$keyReceiver.bind("focus", this.focusKeyReceiver, this, true);
		this.$keyReceiver.bind("blur", this.blurKeyReceiver, this, true);
		this.$keyReceiver.bind("keydown", this.keydownKeyReceiver, this, true);
		this.$keyReceiver.bind("keyup", this.keyupKeyReceiver, this, true);
		this.$keyReceiver.bind("input", this.inputKeyReceiver, this, true);
		this.$keyReceiver.appendTo(this.$lineArea);

		var recognizer = new KeyRecognizer();
		recognizer.listen(this.$keyReceiver);
		recognizer.register({
			"cmd+S": this.save,
			"cmd+O": this.open,
			"cmd+W": this.closeTab,
			"cmd+shift+T": this.openLastTab,

			"cmd+X": this.cut,
			"cmd+C": this.copy,
			"cmd+V": this.paste,

			"cmd+F": this.find,
			"cmd+alt+F": this.replace,

			"cmd+Z": this.undo,
			"cmd+shift+Z": this.redo,

			"cmd+P": this.print,

			"delete": this.delete,
			"backspace": this.backspace,

			"up": this.cursorMovePrevLine,
			"down": this.cursorMoveNextLine,
			"left": this.cursorMovePrev,
			"right": this.cursorMoveNext,

			"shift+up": this.selectionMovePrevLine,
			"shift+down": this.selectionMoveNextLine,
			"shift+left": this.selectionMovePrev,
			"shift+right": this.selectionMoveNext,
			"cmd+A": this.selectAll,

			"cmd+up": this.cursorMoveTop,
			"cmd+down": this.cursorMoveLast,
			"cmd+left": this.cursorMoveLineTop,
			"cmd+right": this.cursorMoveLineLast,
		}, this);

		this.update();
	}
	extendClass(EditorView, View);

	//-------------------------------------------------
	// カーソル

	EditorView.prototype.showCursor = function() {
		this.$cursor.show();
		this.startCursorBlink();
	};

	EditorView.prototype.hideCursor = function() {
		this.stopCursorBlink();
		this.$cursor.hide();
	};

	EditorView.prototype.stopCursorBlink = function() {
		if (this.cursorBlinkTimerID) clearInterval(this.cursorBlinkTimerID);
		this.$cursor.show();
	};

	EditorView.prototype.startCursorBlink = function() {
		this.stopCursorBlink();
		this.cursorBlinkTimerID = setInterval(this.blinkCursor.bind(this), 500);
	};

	EditorView.prototype.blinkCursor = function() {
		if (this.isCursorHide) {
			this.$cursor.show();
		} else {
			this.$cursor.hide();
		}
		this.isCursorHide = !this.isCursorHide;
	}

	EditorView.prototype.setCursorPosition = function() {
		var lines = this.convertTextToHTML().split("\n");

		var cursorPosition = (this.doc.selection.direction === SELECTION_DIR.FRONT) ? this.doc.selection.last : this.doc.selection.start,
			currentLineNumber = 0,
			currentLineStart = 0;

		for (var max = lines.length; currentLineNumber < max;) {
			if (currentLineStart + lines[currentLineNumber].length + 1 > cursorPosition) break;
			currentLineStart += lines[currentLineNumber].length + 1; //1は改行の分
			currentLineNumber++;
		}

		this.$cursor.css({
			marginLeft: this.getPositionByTextCount(currentLineStart, cursorPosition),
			marginTop: 19 * currentLineNumber
		});

		//変換候補の位置
		this.$keyReceiver.css({
			marginLeft: this.getPositionByTextCount(currentLineStart, cursorPosition),
			marginTop: 19 * currentLineNumber
		});

		//選択範囲の描画
		if (this.doc.selection.direction !== SELECTION_DIR.NOSELECT) {
			var selectionStartX = this.getPositionByTextCount(0, this.doc.selection.start),
				selectionLastX = this.getPositionByTextCount(0, this.doc.selection.last);

			this.$selectionRange
				.show()
				.css({
					left: selectionStartX,
					width: selectionLastX - selectionStartX
				});
		} else {
			this.$selectionRange.hide();
		}

		this.startCursorBlink();
	};

	//-------------------------------------------------
	// 描画

	EditorView.prototype.convertTextToHTML = function(text, scope) {
		var parser = new EditorViewSyntaxParser();

		parser.init(this.doc.convertToString());

		var token;
		while (token = parser.pop()) console.log(token);

		return this.doc.convertToString();
	};

	EditorView.prototype.update = function() {
		//文字列の描画

		var lines = this.convertTextToHTML().split("\n");

		this.$lines.remove();
		this.$lineNumbers.remove();

		this.$lines = $();
		this.$lineNumbers = $();

		for (var i = 0, max = lines.length; i < max; i++) {
			var $line = $("<div class='EditorView-line'></div>")
				.appendTo(this.$lineArea)
				.html(lines[i]);
			this.$lines.merge($line);

			var $lineNumber = $("<div class='EditorView-lineNumber'></div>")
				.appendTo(this.$lineNumberArea)
				.html(i);
			this.$lineNumbers.merge($lineNumber);
		}

		//編集中範囲の描画
		if (this.editRange) {
			var editStartX = this.getPositionByTextCount(0, this.editRange.start),
				editLastX = this.getPositionByTextCount(0, this.editRange.last + 1);

			this.$editRange
				.show()
				.css({
					left: editStartX,
					width: editLastX - editStartX
				});
		} else {
			this.$editRange.hide();
		}

		console.log(this.$keyReceiver[0].selectionStart, this.$keyReceiver[0].selectionEnd);
	};

	EditorView.prototype.getPositionByTextCount = function(start, last) {
		this.$dummyLine.text(this.doc.text.slice(start, last));
		return this.$dummyLine[0].getBoundingClientRect().width;
	};

	EditorView.prototype.setFocus = function() {
		this.$keyReceiver.focus();
	};

	//-------------------------------------------------
	// 入力

	EditorView.prototype.readStream = function(editstate) {
		switch (editstate) {
			case EDIT_STATE.PENDING:

				if (!this.editRange) {
					this.editRange = {
						start: this.doc.selection.start,
						last: this.doc.selection.last
					};
				}

				var insertText = this.$keyReceiver.val();
				this.doc.insert(insertText, this.editRange);
				break;

			case EDIT_STATE.DECIDED:
				this.doc.insert(this.$keyReceiver.val(), this.editRange);
				this.$keyReceiver.val("");

				if (this.editRange) {
					this.editRange = null;
					this.update();
				}

				break;
		}
	};

	//-------------------------------------------------
	// イベントハンドラ

	EditorView.prototype.save = function(ev) {
		console.log("save");
	};
	EditorView.prototype.open = function(ev) {
		console.log("open");
	};
	EditorView.prototype.closeTab = function(ev) {
		console.log("closeTab");
	};
	EditorView.prototype.openLastTab = function(ev) {
		console.log("openLastTab");
	};


	EditorView.prototype.cut = function(ev) {
		this.copy(ev);
		this.doc.insert("");
	};
	EditorView.prototype.copy = function(ev) {
		console.log("copy");

		var cutVal = this.doc.text.slice(this.doc.selection.start, this.doc.selection.last),
			$textarea = $("<input type='text' style='position: fixed; top: -9999px;'/>")
			.appendTo(document.body)
			.val(cutVal)
			.focus();

		$textarea[0].select();
		document.execCommand("cut");
		var that = this;
		setTimeout(function() {
			if ($textarea.val() === cutVal) {
				setTimeout(arguments.callee, 50);
				return;
			}

			that.setFocus();
		}, 50);
	};
	EditorView.prototype.paste = function(ev) {
		console.log("paste");
	};


	EditorView.prototype.find = function(ev) {
		console.log("find");
	};
	EditorView.prototype.replace = function(ev) {
		console.log("replace");
	};


	EditorView.prototype.undo = function(ev) {
		console.log("undo");
	};
	EditorView.prototype.redo = function(ev) {
		console.log("redo");
	};


	EditorView.prototype.print = function(ev) {
		console.log("print");
	};



	EditorView.prototype.delete = function(ev) {
		console.log("delete");
		this.doc.delete();
	};
	EditorView.prototype.backspace = function(ev) {
		console.log("backspace");
		this.doc.backspace();
	};


	EditorView.prototype.cursorMovePrevLine = function(ev) {
		console.log("cursorMovePrevLine");
	};
	EditorView.prototype.cursorMoveNextLine = function(ev) {
		console.log("cursorMoveNextLine");
	};
	EditorView.prototype.cursorMovePrev = function(ev) {
		console.log("cursorMovePrev");
		this.doc.cursorMovePrev();
		ev.preventDefault();
	};
	EditorView.prototype.cursorMoveNext = function(ev) {
		console.log("cursorMoveNext");
		this.doc.cursorMoveNext();
		ev.preventDefault();
	};


	EditorView.prototype.selectionMovePrevLin = function(ev) {
		console.log("selectionMovePrevLin");
	};
	EditorView.prototype.selectionMoveNextLine = function(ev) {
		console.log("selectionMoveNextLine");
	};
	EditorView.prototype.selectionMovePrev = function(ev) {
		console.log("selectionMovePrev");
		this.doc.selectionMovePrev();
	};
	EditorView.prototype.selectionMoveNext = function(ev) {
		console.log("selectionMoveNext");
		this.doc.selectionMoveNext();
	};
	EditorView.prototype.selectAll = function(ev) {
		console.log("selectAll");
		this.doc.setRange(0, this.doc.text.length, SELECTION_DIR.FRONT);
	};


	EditorView.prototype.cursorMoveTop = function(ev) {
		console.log("cursorMoveTop");
	};
	EditorView.prototype.cursorMoveLast = function(ev) {
		console.log("cursorMoveLast");
	};
	EditorView.prototype.cursorMoveLineTop = function(ev) {
		console.log("cursorMoveLineTop");
	};
	EditorView.prototype.cursorMoveLineLast = function(ev) {
		console.log("cursorMoveLineLast");
	};



	//-------------------------------------------------
	// プリミティブイベントハンドラ

	EditorView.prototype.clickBase = function() {
		this.setFocus();
	};

	EditorView.prototype.focusKeyReceiver = function(ev) {
		this.showCursor();
	};

	EditorView.prototype.blurKeyReceiver = function(ev) {
		this.hideCursor();
	};

	EditorView.prototype.keydownKeyReceiver = function(ev) {
		if (ev.keyCode === KEYCODE.MULTIBYTE_MODE) {
			this.isMultiByteEdit = true;
		} else {
			if (ev.keyCode !== KEYCODE.SHIFT &&
				ev.keyCode !== KEYCODE.CTRL &&
				ev.keyCode !== KEYCODE.ALT &&
				ev.keyCode !== KEYCODE.SPECIAL &&
				this.isMultiByteEdit) {

				this.readStream(EDIT_STATE.DECIDED);
			}
		}
	};

	EditorView.prototype.keyupKeyReceiver = function(ev) {
		//keyupが必要なのはマルチバイトモード時のみ
		if (!this.isMultiByteEdit) return

		if (ev.keyCode === KEYCODE.ENTER) {
			if (this.isMultiByteEdit) {
				this.isMultiByteEdit = false;
				this.readStream(EDIT_STATE.DECIDED);
			}
		}
	};

	EditorView.prototype.inputKeyReceiver = function(ev) {
		if (this.isMultiByteEdit) {
			this.readStream(EDIT_STATE.PENDING);
		} else {
			this.readStream(EDIT_STATE.DECIDED);
		}
	};

	return EditorView;
}());
