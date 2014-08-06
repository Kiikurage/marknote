var NoteViewTextBoxModel = (function() {
	function NoteViewTextBoxModel() {
		this.__position = {
			top: 0,
			left: 0,
		};
		this.__value = "";
	}
	IPubSub.implement(NoteViewTextBoxModel.prototype);

	NoteViewTextBoxModel.prototype.val = function(text) {
		return (arguments.length === 0) ? this.getVal() : this.setVal(text);
	};
	NoteViewTextBoxModel.prototype.getVal = function() {
		return this.__value;
	};
	NoteViewTextBoxModel.prototype.setVal = function(text) {
		this.__value = text;
		this.fire("update", this, this.getVal());
	};

	NoteViewTextBoxModel.prototype.pos = function(top, left) {
		return (arguments.length === 0) ? this.getPos() : this.setPos(top, left);
	};
	NoteViewTextBoxModel.prototype.getPos = function() {
		//return by value(not by reference)
		return {
			top: this.__position.top,
			left: this.__position.left
		};
	};
	NoteViewTextBoxModel.prototype.setPos = function(top, left) {
		this.__position = {
			top: top,
			left: left
		};
		this.fire("updatePosition", this, this.getPos());
	};

	NoteViewTextBoxModel.prototype.parseToNativeObject = function() {
		return {
			position: this.getPos(),
			value: this.getVal()
		};
	};

	return NoteViewTextBoxModel;
}());
