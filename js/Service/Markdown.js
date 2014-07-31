var Markdown = (function() {
	var TokenType = {
		NormalText: 0,
		Header1: 1,
		Header2: 2,
		Header3: 3,
		Header4: 4,
		Header5: 5,
		Header6: 6,
		Bold: 7,
		Italic: 8,
		HorizontalLine: 9,
		NewParagraph: 10
	}

	function parse(text) {
		var tokens = tokenize(text),
			html = convertToHTML(tokens);
		return html;
	};

	function tokenize(text) {
		var lines = text.split("\n"),
			res = [];


		for (var i = 0, max = lines.length; i < max; i++) {
			var line = lines[i],
				ma = null;

			//1. line-head function
			if (line === "") {
				res.push({
					type: TokenType.NewParagraph,
					text: ""
				});
				continue;
			}

			if (ma = line.match(/^(#{1,6})/)) {
				switch (ma[1].length) {
					case 1:
						res.push({
							type: TokenType.Header1,
							text: line.slice(1)
						});
						break;

					case 2:
						res.push({
							type: TokenType.Header2,
							text: line.slice(2)
						});
						break;

					case 3:
						res.push({
							type: TokenType.Header3,
							text: line.slice(3)
						});
						break;

					case 4:
						res.push({
							type: TokenType.Header4,
							text: line.slice(4)
						});
						break;

					case 5:
						res.push({
							type: TokenType.Header5,
							text: line.slice(5)
						});
						break;

					case 6:
						res.push({
							type: TokenType.Header6,
							text: line.slice(6)
						});
						break;
				}
				continue;
			}

			if (line.match(/^(?:-{3,}|={3,}|\*{3,})$/)) {
				res.push({
					type: TokenType.HorizontalLine,
					text: ""
				});
				continue;
			}

			//2. inline functions

			res.push({
				type: TokenType.NormalText,
				text: line
			});
		}

		return res;
	};

	function convertToHTML(tokens) {
		var res = "<p>";

		for (var i = 0, max = tokens.length; i < max; i++) {
			var token = tokens[i];

			switch (token.type) {
				case TokenType.Header1:
					res += "</p><h1>" + token.text + "</h1><p>";
					break;

				case TokenType.Header2:
					res += "</p><h2>" + token.text + "</h2><p>";
					break;

				case TokenType.Header3:
					res += "</p><h3>" + token.text + "</h3><p>";
					break;

				case TokenType.Header4:
					res += "</p><h4>" + token.text + "</h4><p>";
					break;

				case TokenType.Header5:
					res += "</p><h5>" + token.text + "</h5><p>";
					break;

				case TokenType.Header6:
					res += "</p><h6>" + token.text + "</h6><p>";
					break;

				case TokenType.Bold:
					res += "<span class='Markdown-bold'>" + token.text + "</span>";
					break;

				case TokenType.Italic:
					res += "<span class='Markdown-italic'>" + token.text + "</span>";
					break;

				case TokenType.HorizontalLine:
					res += "</p><hr /><p>";
					break;

				case TokenType.NewParagraph:
					res += "</p><p>";
					break;

				default:
					res += token.text;
			}
		}

		return res;
	};

	return {
		parse: parse
	};
}());
