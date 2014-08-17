var NoteViewScopeParser = (function(exports) {

	exports.convertLineToHTML = function(line) {
		var scope = [],
			height = 24,
			res = "";

		while (line[0] === "\t") {
			line = line.slice(1);
			var inner = wrapWithScope("", ["NoteViewTextbox-scope-symbolblock-indent-inner"]);
			res += wrapWithScope(inner, ["NoteViewTextbox-scope-symbolblock", "NoteViewTextbox-scope-symbolblock-indent"]);
		}

		var headerLevel = 0;
		while (line[headerLevel] === "#") {
			headerLevel++;
		}
		if (headerLevel) {
			scope.push("NoteViewTextbox-scope-header" + headerLevel);
			height = [65, 62, 20][headerLevel - 1];
		}

		if (line[0] === "-") {
			line = line.slice(1);
			scope.push("NoteViewTextbox-scope-list");
			var inner = wrapWithScope("", ["NoteViewTextbox-scope-symbolblock-list-inner"]);
			res += wrapWithScope(inner, ["NoteViewTextbox-scope-symbolblock", "NoteViewTextbox-scope-symbolblock-list"]);
		}

		line = line.replace(/\s/g, "&nbsp;");

		line = line.replace(/\*[^\*]*\*/g, function(outer) {
			return wrapWithScope(outer, ["NoteViewTextbox-scope-bold"]);
		});

		res += wrapWithScope(line, scope);

		return {
			html: "<p class='NoteViewTextbox-line'>" + res + "</p>",
			height: height
		}
	};

	function wrapWithScope(text, scope) {
		var scopes = ["NoteViewTextbox-scope"];

		if (scope) scopes = scopes.concat(scope);

		return "<span class='" + scopes.join(" ") + "'>" + text + "</span>"
	}

	return exports;
}({}));
