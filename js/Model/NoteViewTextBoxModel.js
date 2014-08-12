//#include("/Model/Model.js");

var NoteViewTextboxModel = (function() {
	function NoteViewTextboxModel() {
		this.__lines = [""];
		this._w = 400;
		this._z = 0;
	}
	extendClass(NoteViewTextboxModel, Model);

	NoteViewTextboxModel.__record("x");
	NoteViewTextboxModel.__record("y");
	NoteViewTextboxModel.__record("z");
	NoteViewTextboxModel.__record("w");
	NoteViewTextboxModel.__record("text", function() {
		return this.__lines.join("\n");
	}, function(text) {
		this.__lines = text.split("\n");
	});

	NoteViewTextboxModel.prototype.getLines = function() {
		return this.__lines
	};

	NoteViewTextboxModel.prototype.getLine = function(line) {
		return this.__lines[line];
	};

	NoteViewTextboxModel.prototype.getLineLength = function(line) {
		return this.__lines[line].length;
	};

	NoteViewTextboxModel.prototype.getLinesCount = function() {
		return this.__lines.length;
	};


	NoteViewTextboxModel.prototype.splice = function(start, end, value) {
		if (start.row !== end.row && start.column !== end.column) {

			var newLine = this.__lines[start.row].slice(0, start.column) + this.__lines[end.row].slice(end.column);
			this.__lines.splice(start.row, end.row - start.row + 1, newLine);

		} else {

			var line = this.__lines[start.row],
				newLine = line.slice(0, start.column) + value + line.slice(end.column);
			this.__lines[start.row] = newLine;
		}

		this.fire("update");
	};

	return NoteViewTextboxModel;
}());
