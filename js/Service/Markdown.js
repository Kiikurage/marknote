var Markdown = (function() {
	var TokenType = {
		NormalText: 0,
		Header: 1,
		Bold: 7,
		Italic: 8,
		HorizontalLine: 9,
		Paragraph: 10,
		List: 11,
	};

	var MarkdownToken = (function() {
		function MarkdownToken(type, value) {
			this.type = type || TokenType.NormalText;
			this.value = value || "";
			this.parent = null;
			this.children = [];
			this.indentLevel = 0;
		};

		MarkdownToken.prototype.appendChild = function(childToken) {
			childToken.parent = this;
			childToken.indentLevel = this.indentLevel + 1;
			this.children.push(childToken);
		};

		MarkdownToken.prototype.print = function() {
			var indent = new Array(this.indentLevel + 1).join("....");
			if (this.type === TokenType.NormalText) {
				console.log(indent + "<" + this.type + ">" + this.value + "</" + this.type + ">");
			} else {
				console.log(indent + "<" + this.type + ">");
				for (var i = 0, max = this.children.length; i < max; i++) this.children[i].print();
				console.log(indent + "</" + this.type + ">");
			}
		};

		MarkdownToken.prototype.prev = function() {
			var index = this.parent.children.indexOf(this);
			if (this.parent.children[index - 1]) {
				return this.parent.children[index - 1];
			}
			return null;
		};

		MarkdownToken.prototype.next = function() {
			var index = this.parent.children.indexOf(this);
			if (this.parent.children[index + 1]) {
				return this.parent.children[index + 1];
			}
			return null;
		};

		return MarkdownToken;
	}());


	function parse(text) {
		var rootNode = tokenize(text),
			html = convertToHTML(rootNode);

		return html;
	};

	function tokenize(text) {
		var lines = text.split("\n"),
			res = scope = new MarkdownToken(TokenType.Paragraph);

		for (var i = 0, max = lines.length; i < max; i++) {
			var line = lines[i],
				ma = null;

			//0. preprocessing
			var indentLevel = 0;
			if (ma = line.match(/^(\t+)(.*)$/)) {
				indentLevel = ma[1].length;
				line = ma[2];
			}
			while (indentLevel > scope.indentLevel) {
				var newToken = new MarkdownToken(TokenType.Paragraph);
				scope.appendChild(newToken);
				scope = newToken;
			}
			while (indentLevel < scope.indentLevel) {
				scope = scope.parent;
			}

			//1. line-head function
			if (line === "") {
				while (scope.indentLevel > 0) {
					scope = scope.parent;
				}
				continue;
			}

			if (ma = line.match(/^#(.*)$/)) {
				var newToken = new MarkdownToken(TokenType.Header, ma[1]);
				scope.appendChild(newToken);
				continue;
			}

			if (line.match(/^(?:-{3,}|={3,}|\*{3,})$/)) {
				var newToken = new MarkdownToken(TokenType.HorizontalLine);
				scope.appendChild(newToken);
				continue;
			}

			if (ma = line.match(/^\-[ \t]*(.*)?$/)) {
				var newToken = new MarkdownToken(TokenType.List);
				scope.appendChild(newToken);
				scope = newToken;

				line = ma[1];
			}

			//2. inline functions

			if (line != "") {
				var newToken = new MarkdownToken(TokenType.NormalText, line);
				scope.appendChild(newToken);
			}
		}

		return res;
	};

	function convertToHTML(rootNode) {
		var html = convertToOpenHTML(rootNode)
		for (var i = 0, max = rootNode.children.length; i < max; i++) {
			html += convertToHTML(rootNode.children[i]);
		}
		html += convertToCloseHTML(rootNode)

		return html;
	};

	function convertToOpenHTML(token) {
		switch (token.type) {
			case TokenType.Paragraph:
				return "<div class='Markdown-block'>"
				break;

			case TokenType.List:
				var prev = token.prev();
				if (prev && prev.type === TokenType.List) {
					return "<li class='Markdown-listItem'>"
				}
				return "<ul class='Markdown-list'><li class='Markdown-listItem'>";
				break;

			case TokenType.HorizontalLine:
				return "<hr class='Markdown-horizontalLine'/>";
				break;

			case TokenType.Header:
				var level = (token.indentLevel < 1) ?
					1 :
					(token.indentLevel > 6) ?
					6 :
					token.indentLevel;
				return "<h" + level + " class='Markdown-header'>" + token.value + "</h" + level + ">";
				break;

			case TokenType.NormalText:
				var prev = token.prev();
				if (prev && prev.type === TokenType.NormalText) {
					return token.value
				}
				return "<p class='Markdown-paragraph'>" + token.value;
				break;
		}

		return "";
	};

	function convertToCloseHTML(token) {
		switch (token.type) {
			case TokenType.Paragraph:
				return "</div>"
				break;

			case TokenType.List:
				var next = token.next();
				if (next && next.type === TokenType.List) {
					return "</li>"
				}
				return "</li></ul>";
				break;

			case TokenType.NormalText:
				var next = token.next();
				if (next && next.type === TokenType.NormalText) {
					return "";
				}
				return "</p>";
				break;
		}

		return "";
	};

	return {
		parse: parse
	};
}());
