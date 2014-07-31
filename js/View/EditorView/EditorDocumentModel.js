//#include("/Interface/IPubSub.js");

var EditorDocumentModel = (function() {
	function EditorDocumentModel(str) {
		this.text = "";

		this.selection = {
			start: 0,
			last: 0,
			direction: SELECTION_DIR.FRONT
		};
		if (typeof str === "string") this.convertFromString(str);
	}
	IPubSub.implement(EditorDocumentModel.prototype);

	//-------------------------------------------------
	// 文字列とオブジェクトの相互変換

	// オブジェクトから文字列へ
	EditorDocumentModel.prototype.convertToString = function() {
		return this.text;
	};

	// 文字列からオブジェクトへ
	EditorDocumentModel.prototype.convertFromString = function(text) {
		this.text = text;
	};

	//-------------------------------------------------
	// 編集

	// 指定範囲に文字列を挿入
	EditorDocumentModel.prototype.insert = function(insertText, selection) {
		var selection = selection || this.selection,
			text = this.text,
			prev = text.slice(0, selection.start),
			next = text.slice(selection.last);

		this.text = prev + insertText + next;

		this.setPos(selection.start + insertText.length);

		if (selection) selection.last = this.selection.last;

		this.fire("change");
	};

	//-------------------------------------------------
	// 削除

	// カーソルの前方を削除する(BackSpace)
	EditorDocumentModel.prototype.backspace = function() {
		var selection = this.selection;

		if (selection.start === selection.last) {
			//擬似的に、前の1文字を選択していることにする
			this.setRange(selection.start - 1, selection.last);
		}
		this.deleteSelection();
	};

	// カーソルの後方を削除する(Delete)
	EditorDocumentModel.prototype.delete = function() {
		var selection = this.selection;

		if (selection.start === selection.last) {
			//擬似的に、後ろの1文字を選択していることにする
			this.setRange(selection.start, selection.last + 1);
		}
		this.deleteSelection();
	};

	// 選択範囲を削除する
	EditorDocumentModel.prototype.deleteSelection = function() {
		this.insert("");
	};

	//-------------------------------------------------
	// カーソル処理

	// カーソルを前に移動
	EditorDocumentModel.prototype.cursorMovePrev = function() {
		var selection = this.selection;

		if (selection.direction === SELECTION_DIR.NOSELECT) {
			this.setPos(selection.start - 1);
		} else {
			this.setPos(selection.start);
		}
	};

	// カーソルを後ろに移動
	EditorDocumentModel.prototype.cursorMoveNext = function() {
		var selection = this.selection;

		if (selection.direction === SELECTION_DIR.NOSELECT) {
			this.setPos(selection.last + 1);
		} else {
			this.setPos(selection.last);
		}
	};

	EditorDocumentModel.prototype.selectionMovePrev = function() {
		var selection = this.selection;

		if (selection.direction === SELECTION_DIR.FRONT) {
			this.setRange(selection.start, selection.last - 1, SELECTION_DIR.FRONT);
		} else {
			this.setRange(selection.start - 1, selection.last, SELECTION_DIR.BACK);
		}
	};

	EditorDocumentModel.prototype.selectionMoveNext = function() {
		var selection = this.selection;

		if (selection.direction === SELECTION_DIR.BACK) {
			this.setRange(selection.start + 1, selection.last, SELECTION_DIR.BACK);
		} else {
			this.setRange(selection.start, selection.last + 1, SELECTION_DIR.FRONT);
		}
	}

	// カーソルを指定位置に移動
	EditorDocumentModel.prototype.setPos = function(pos) {
		if (pos < 0 || pos > this.text.length) return;

		var selection = this.selection;
		selection.start = pos;
		selection.last = pos;
		selection.direction = SELECTION_DIR.NOSELECT;

		this.fire("cursormove");
	};

	// カーソルを指定範囲に移動
	EditorDocumentModel.prototype.setRange = function(start, last, direction) {
		if (start === last) return this.setPos(start);
		if (start > last) return this.setRange(last, start, direction);

		if (start < 0 || last > this.text.length) return;

		var selection = this.selection;

		selection.start = start;
		selection.last = last;
		selection.direction = direction || SELECTION_DIR.FRONT;

		this.fire("cursormove");
	};

	return EditorDocumentModel;
}());
