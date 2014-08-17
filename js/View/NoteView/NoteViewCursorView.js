//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Model/NoteViewTextboxModel.js");
//#include("/Service/KeyRecognizer.js");

var BLINK_INTERVAL = 600;

var DIR = {
	FORWARD: 0,
	BACKWARD: 1
};

var NoteViewCursorView = (function() {

	function NoteViewCursorView(receiver) {
		this.super();

		this.__$base = $("<div class='NoteViewCursorView-base'></div>");
		this.__blinkTimerID = null;

		this.__$inputReceiver = $("<input type='text' />");
		this.__$inputReceiver.appendTo($("body"));
		this.__$inputReceiver.bind("blur", this.__blur, this, true);
		this.__$inputReceiver.bind("input", this.__input, this, true);

		this.__$marker = $("<span class='NoteViewCursorView-marker'></span>");

		this.__kr = new KeyRecognizer();
		this.__kr.listen(this.__$inputReceiver);
		this.__kr.register({
			"up": this.__inputMoveUp,
			"down": this.__inputMoveDown,
			"left": this.__inputMoveLeft,
			"right": this.__inputMoveRight,
			"enter": this.__inputNewLine,
			"tab": this.__inputTab,
			"multibyte_mode": this.__inputMultiByteMode,
			"backspace": this.__inputBackSpace,
			"delete": this.__inputDelete,
		}, this)

		//debug only start
		this.__$inputReceiver.css({
			display: "fixed",
			bottom: 0,
			left: 0,
			zIndex: 65535
		});
		//debug only end

		this.selection = {
			start: {
				row: 0,
				column: 0
			},
			end: {
				row: 0,
				column: 0
			},
			direction: DIR.FORWARD
		};

		this.targetTextBox = null;
	}

	extendClass(NoteViewCursorView, View);


	/*-------------------------------------------------
	 *	Event Handler
	 */
	NoteViewCursorView.prototype.__textBoxUpdate = function() {
		this.update();
	};

	NoteViewCursorView.prototype.__blur = function(ev) {
		this.fire("blur");
	};

	NoteViewCursorView.prototype.__input = function(ev) {
		this.inputText(this.__$inputReceiver.val());
		this.__$inputReceiver.val("");
	};

	NoteViewCursorView.prototype.__inputMoveUp = function(ev) {
		this.selection.end.row = this.selection.start.row -= 1;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize(null, null, false);
	};

	NoteViewCursorView.prototype.__inputMoveDown = function(ev) {
		this.selection.end.row = this.selection.start.row += 1;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize(null, null, false);
	};

	NoteViewCursorView.prototype.__inputMoveLeft = function(ev) {
		this.selection.end.column = this.selection.start.column -= 1;
		this.selection.end.row = this.selection.start.row;

		this.__selectionNormalize(null, null, true);
	};

	NoteViewCursorView.prototype.__inputMoveRight = function(ev) {
		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column += 1;

		this.__selectionNormalize(null, null, true);
	};

	NoteViewCursorView.prototype.__inputNewLine = function(ev) {
		this.targetTextBox.model.addNewLine(this.selection.start);

		this.selection.start.row++;
		this.selection.start.column = 0;

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize(null, null);
	};

	NoteViewCursorView.prototype.__inputTab = function(ev) {
		this.inputText("\t");
		ev.preventDefault();
	};

	NoteViewCursorView.prototype.__inputBackSpace = function(ev) {
		this.selection.start.column -= 1;
		this.__selectionNormalize(null, null, true);

		this.targetTextBox.model.splice(this.selection.start, this.selection.end, "");

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;
		this.__selectionNormalize(null, null, true);

		ev.preventDefault();
	};

	NoteViewCursorView.prototype.__inputDelete = function(ev) {
		this.selection.end.column += 1;
		this.__selectionNormalize(null, null, true);

		this.targetTextBox.model.splice(this.selection.start, this.selection.end, "");

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;
		this.__selectionNormalize(null, null, true);

		ev.preventDefault();
	};

	NoteViewCursorView.prototype.__inputMultiByteMode = function(ev) {
		this.__$inputReceiver.unbind("input", this.__input, this, true);
		this.__$inputReceiver.bind("input", this.__inputInMultiByteMode, this, true);
		this.__$inputReceiver.bind("keyup", this.__keyupInMultiByteMode, this, true);
	};

	NoteViewCursorView.prototype.__inputInMultiByteMode = function(ev) {
		this.inputText(this.__$inputReceiver.val(), true);
	};

	NoteViewCursorView.prototype.__keyupInMultiByteMode = function(ev) {
		if (ev.keyCode === KEYCODE.ENTER) {
			this.inputText(this.__$inputReceiver.val());
			this.__$inputReceiver.val("");
			this.__$inputReceiver.bind("input", this.__input, this, true);
			this.__$inputReceiver.unbind("input", this.__inputInMultiByteMode, this, true);
			this.__$inputReceiver.unbind("keyup", this.__keyupInMultiByteMode, this, true);
		}
	};

	/*-------------------------------------------------
	 *	Input
	 */
	NoteViewCursorView.prototype.inputText = function(text, flagNOForward) {
		if (!this.targetTextBox) return;

		var start = this.selection.start,
			end = this.selection.end;

		this.targetTextBox.model.splice(start, end, text);

		if (flagNOForward) {
			end.row = start.row;
			end.column = start.column + text.length;
		} else {
			end.row = start.row;
			end.column = start.column += text.length;
		}

		this.__selectionNormalize(null, null, true);
	};

	/*-------------------------------------------------
	 *	attach/detach
	 */
	NoteViewCursorView.prototype.attach = function(textbox) {
		this.targetTextBox = textbox;
		this.appendTo(textbox.__$cursorLayer);
		textbox.bind("update", this.__textBoxUpdate, this);

		this.bind("blur", textbox.lostFocus, textbox);
		this.__$inputReceiver.focus();
	};

	NoteViewCursorView.prototype.detach = function(textbox) {
		this.targetTextBox = null;
		textbox.unbind("update", this.__textBoxUpdate, this);

		this.unbind("blur", textbox.lostFocus, textbox);
		this.hide();
	};

	/*-------------------------------------------------
	 *	visiblity
	 */
	NoteViewCursorView.prototype.hide = function() {
		if (this.__blinkTimerID) {
			clearInterval(this.__blinkTimerID);
			this.__blinkTimerID = null;
		}

		this.__$base.removeClass("-show");
	};

	NoteViewCursorView.prototype.show = function() {
		if (this.__blinkTimerID) {
			clearInterval(this.__blinkTimerID);
			this.__blinkTimerID = null;
		}

		var that = this;
		this.__blinkTimerID = setInterval(function() {
			that.blink();
		}, BLINK_INTERVAL);

		this.__$base.addClass("-show");
	};

	NoteViewCursorView.prototype.blink = function() {
		this.__$base.toggleClass("-show");
	};

	/*-------------------------------------------------
	 *	selection
	 */
	NoteViewCursorView.prototype.__selectionNormalize = function(start, end, flagChangeLine) {
		if (!this.targetTextBox) return;

		var start = start || this.selection.start,
			end = end || this.selection.end;
		this.__positionNormalize(start, flagChangeLine);
		this.__positionNormalize(end, flagChangeLine);

		//swap if start is after than end
		if (start.row > end.row || (start.row === end.row && start.column > end.column)) {
			var tmp = start.row
			start.row = end.row;
			end.row = tmp;

			tmp = start.column;
			start.column = end.column;
			end.column = tmp;
		}

		this.update();
	};

	NoteViewCursorView.prototype.__positionNormalize = function(position, flagChangeLine) {
		if (!this.targetTextBox) return;

		var model = this.targetTextBox.model;

		if (position.row < 0) {
			position.row = 0;
			position.column = 0;
			return;

		} else if (position.row >= model.getLinesCount()) {
			position.row = model.getLinesCount() - 1;
			position.column = model.getLineLength(position.row);
			return;

		}


		if (!flagChangeLine) {
			if (position.column < 0) {
				position.column = 0
			} else if (position.column > model.getLineLength(position.row)) {
				position.column = model.getLineLength(position.row);
			}
			return;
		}

		while (position.column < 0) {

			if (position.row === 0) {
				position.row = 0;
				position.column = 0;
				return;
			}

			position.row--;
			position.column += model.getLineLength(position.row) + 1; //+1 for CRLF
		}

		while (position.column > model.getLineLength(position.row)) {

			if (position.row === model.getLinesCount() - 1) {
				position.row = model.getLinesCount() - 1;
				position.column = model.getLineLength(model.getLinesCount() - 1);
				return;
			}

			position.column -= model.getLineLength(position.row) + 1; //+1 for CRLF
			position.row++;
		}
	};

	NoteViewCursorView.prototype.setSelection = function(startRow, startColumn, endRow, endColumn) {
		var start = this.selection.start,
			end = this.selection.end;

		if (arguments.length === 4) {

			start.row = arguments[0];
			start.column = arguments[1];
			end.row = arguments[2];
			end.column = arguments[3];
			return;

		} else if (typeof arguments[0] === "number") {

			start.row = arguments[0];
			start.column = arguments[1];
			end.row = arguments[0];
			end.column = arguments[1];

		} else {

			start.row = arguments[0].row;
			start.column = arguments[0].column;
			end.row = arguments[1].row;
			end.column = arguments[1].column;

		}

		this.update();
	};

	/*-------------------------------------------------
	 *	update
	 */
	NoteViewCursorView.prototype.update = function() {
		if (!this.targetTextBox) return;

		var renderingInfo = this.targetTextBox.renderingInfo,
			start = this.selection.start,
			end = this.selection.end,
			position,
			x, y, h;

		if (this.selection.direction === DIR.FORWARD) {
			position = end;
		} else {
			position = start;
		}

		this.__positionNormalize(position, false);
		y = renderingInfo[position.row].top;
		h = renderingInfo[position.row].height;
		x = this.convertPointToScreenPosition(position) - 1;

		this.__$base.css({
			left: x,
			top: y,
			height: h
		});

		this.show();
		document.title = "Lines " + position.row + ", Columns " + position.column;
	};

	NoteViewCursorView.prototype.convertPointToScreenPosition = function(position) {
		if (!this.targetTextBox) return;

		var renderingInfo = this.targetTextBox.renderingInfo,
			row = position.row,
			column = position.column,
			x, y;

		y = renderingInfo[row].top;

		var offset = 0,
			marker = this.__$marker[0],
			flagFinish = false,
			NODETYPE_TEXT = 3;

		function detectXposition(rootNode) {
			var children = rootNode.childNodes
			for (var i = 0, max = children.length; i < max; i++) {
				var child = children[i];

				if (offset === column) {
					rootNode.insertBefore(marker, child);
					flagFinish = true;
					return;
				}

				if (child.nodeType === NODETYPE_TEXT) {
					if (offset === column) {
						rootNode.insertBefore(marker, child);
						flagFinish = true;
						return;

					} else if (offset + child.length > column) {
						rootNode.insertBefore(marker, child.splitText(column - offset));
						flagFinish = true;
						return;

					} else {
						offset += child.length;

					}
				} else {
					if (child.classList.contains("NoteViewTextbox-scope-symbolblock")) {
						offset += 1;
					} else {
						detectXposition(child);
						if (flagFinish) return
					}
				}
			}
		}

		this.__$marker.remove();
		detectXposition(renderingInfo[row].node);

		if (!flagFinish) {
			this.__$marker.appendTo(renderingInfo[row].node);
		}

		return this.__$marker.getBoundingClientRectBy(renderingInfo[row].node).left;
	};

	return NoteViewCursorView
}());
