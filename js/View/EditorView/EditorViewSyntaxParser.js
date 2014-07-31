var EditorViewSyntaxParser = (function() {
	function EditorViewSyntaxParser() {
		this.text = "";
		this.pivot = 0;
		this.length = 0;
		this.max = 0;
		this.isFinish = true;
	};

	EditorViewSyntaxParser.prototype.init = function(text) {
		this.text = text;
		this.pivot = 0;
		this.length = 1;
		this.max = this.text.length;
		this.isFinish = false;
	};

	EditorViewSyntaxParser.prototype.pop = function() {
		if (this.isFinish) return false;

		while (this.pivot + this.length <= this.max) {
			if (this.checkToken(this.pivot + this.length - 1, 1)) {
				if (this.length > 1) this.length--;
				return this.publishToken();
			}
			this.length++;
		}

		this.isFinish = true;

		if (this.pivot < this.max) return this.publishToken();

		return false;
	};

	EditorViewSyntaxParser.prototype.checkToken = function(pivot, length) {
		var delimiters = /^["'\+\-\*\/=\^<>\s]$/;

		return delimiters.test(this.text.substr(pivot, length))
	};

	EditorViewSyntaxParser.prototype.publishToken = function() {
		var res = {
			pivot: this.pivot,
			length: this.length,
			token: this.text.substr(this.pivot, this.length)
		};

		this.pivot += this.length;
		this.length = 1;

		return res;
	};

	return EditorViewSyntaxParser;
}());
