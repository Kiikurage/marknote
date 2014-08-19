var NoteViewScopeParser = (function(exports) {
	var IS_ICON_SCOPE = true;

	exports.IconScopeClass = "NoteViewTextbox-scope-icon";

	exports.convertLineToHTML = function(line) {
		var scope = [],
			height = 24,
			res = "";

		//indent
		while (line[0] === "\t") {
			line = line.slice(1);
			var inner = wrapWithScope("", ["NoteViewTextbox-scope-indent-inner"]);
			res += wrapWithScope(inner, ["NoteViewTextbox-scope-indent"], IS_ICON_SCOPE);
		}

		//header
		var headerLevel = 0;
		while (line[headerLevel] === "#") {
			headerLevel++;
		}
		if (headerLevel) {
			scope.push("NoteViewTextbox-scope-header" + headerLevel);
			height = [65, 62, 20][headerLevel - 1];
		}

		//list
		if (line[0] === "-") {
			line = line.slice(1);
			var inner = wrapWithScope("", ["NoteViewTextbox-scope-list-inner"]);
			res += wrapWithScope(inner, ["NoteViewTextbox-scope-list"], IS_ICON_SCOPE);
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

	function wrapWithScope(text, scope, isIconScope) {
		var scopes = ["NoteViewTextbox-scope"];

		if (scope) scopes = scopes.concat(scope);
		if (isIconScope) scopes.push(NoteViewScopeParser.IconScopeClass);


		return "<span class='" + scopes.join(" ") + "'>" + text + "</span>";
	}

	return exports;
}({}));
