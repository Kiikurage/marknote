//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Model/NoteViewTextboxModel.js");
//#include("/Service/KeyRecognizer.js");

var BLINK_INTERVAL = 500;

var NoteViewCursorView = (function() {

	function NoteViewCursorView(receiver) {
		this.super();

		this.__$base = $("<div class='NoteViewCursorView-base'></div>");
		this.__blinkTimerID = null;

		this.__$inputReceiver = $("<input type='text' />");
		this.__$inputReceiver.appendTo($("body"));
		this.__$inputReceiver.bind("blur", this.__blur, this, true);
		this.__$inputReceiver.bind("input", this.__input, this, true);

		this.__kr = new KeyRecognizer();
		this.__kr.listen(this.__$inputReceiver);
		this.__kr.register({
			"up": this.__inputMoveUp,
			"down": this.__inputMoveDown,
			"left": this.__inputMoveLeft,
			"right": this.__inputMoveRight
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
			}
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
		this.selection.start.row--;
		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveDown = function(ev) {
		this.selection.start.row++;
		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveLeft = function(ev) {
		this.selection.start.column--;
		if (this.selection.start.column < 0) {
			if (this.selection.start.row === 0) {
				this.selection.start.column = 0
			} else {
				this.selection.start.row--;
				this.selection.start.column = this.targetTextBox.model.getLine(this.selection.start.row).length
			}
		}

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveRight = function(ev) {
		this.selection.start.column++;
		if (this.selection.start.column > this.targetTextBox.model.getLineLength(this.selection.start.row)) {
			if (this.selection.start.row === this.targetTextBox.model.getLinesCount()) {
				this.selection.start.column = this.targetTextBox.model.getLineLength()
			} else {
				this.selection.start.row++;
				this.selection.start.column = 0;
			}
		}

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	}
	/*-------------------------------------------------
	 *	Input
	 */
	NoteViewCursorView.prototype.inputText = function(text) {
		if (!this.targetTextBox) return;

		var start = this.selection.start,
			end = this.selection.end;

		this.targetTextBox.model.splice(start, end, text);

		end.row = start.row;
		end.column = start.column += text.length;

		this.__selectionNormalize();
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
		if (!this.__blinkTimerID) {
			var that = this;
			this.__blinkTimerID = setInterval(function() {
				that.blink();
			}, BLINK_INTERVAL);
		}

		this.__$base.addClass("-show");
	};

	NoteViewCursorView.prototype.blink = function() {
		this.__$base.toggleClass("-show");
	};

	/*-------------------------------------------------
	 *	selection
	 */
	NoteViewCursorView.prototype.__selectionNormalize = function() {
		if (!this.targetTextBox) return;

		var start = this.selection.start,
			end = this.selection.end;
		this.__positionNormalize(start);
		this.__positionNormalize(end);

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

	NoteViewCursorView.prototype.__positionNormalize = function(position) {
		if (!this.targetTextBox) return;

		var lines = this.targetTextBox.model.getLines();

		if (position.row < 0) {
			position.row = 0;
			position.column = 0;
			return;

		} else if (position.row >= lines.length) {
			position.row = lines.length - 1;
			position.column = lines[lines.length - 1].length;
			return;

		}
	};

	/*-------------------------------------------------
	 *	update
	 */
	NoteViewCursorView.prototype.update = function() {
		if (!this.targetTextBox) return;

		var renderingInfo = this.targetTextBox.renderingInfo,
			start = this.selection.start,
			end = this.selection.end,
			x, y, h;

		y = renderingInfo[start.row].top;
		h = renderingInfo[start.row].height;
		x = Math.min(start.column, this.targetTextBox.model.getLineLength(start.row)) * h / 3;

		this.__$base.css({
			left: x,
			top: y,
			height: h
		});

		this.show();
	};

	//指定された座標が論理行で何行目何文字目かを返す
	// NoteViewCursorView.prototype.getCursorPositionByScreenPosition = function(x, y) {
	// 	var lines = this.model.text.split("\n"),
	// 		$lineElements = this.__$textLayer.children(),
	// 		row = 0,
	// 		column = 0;

	// 	//y方向(row)
	// 	for (var max = $lineElements.length; row < max; row++) {
	// 		if (this.renderingInfo[row].top > y) break
	// 	}
	// 	row--;

	// 	//範囲外
	// 	if (row < 0 || row >= lines.length) {
	// 		return {
	// 			row: row,
	// 			column: -1
	// 		};
	// 	}

	// 	//x方向(column)
	// 	var parentScope = $lineElements[row];
	// 	console.dir(parentScope.childNodes[0].childNodes[0])

	// 	return {
	// 		row: row,
	// 		column: column
	// 	};
	// };

	return NoteViewCursorView
}());
