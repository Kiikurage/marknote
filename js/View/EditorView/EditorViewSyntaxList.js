[{
	scope: "html",
	syntax: [{
		pattern: "<",
		template: "&lt;",
		scope: "tag"
	}, {
		pattern: ">",
		template: "&gt;",
		scope: "tag"
	}]
}, {
	scope: "tag",
	syntax: [{
		pattern: "\'",
		template: "\'",
		scope: "quot"
	}, {
		pattern: "\"",
		template: "\"",
		scope: "dquot"
	}]
}, {
	scope: "quot",
	syntax: [{
		pattern: "\'",
		template: "\'",
		scope: "tag"
	}]
}, {
	scope: "dquot",
	syntax: [{
		pattern: "\"",
		template: "\"",
		scope: "tag"
	}]
}]
