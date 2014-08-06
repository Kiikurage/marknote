//#include("/Interface/IPubSub.js");

var KeyRecognizer = (function() {

	function KeyRecognizer() {

	}
	IPubSub.implement(KeyRecognizer.prototype);

	KeyRecognizer.prototype.listen = function(node) {
		node.bind("keydown", this.__keyDownListener, this, true);
	};

	KeyRecognizer.prototype.unlisten = function(node) {
		node.unbind("keydown", this.__keyDownListener, this, true);
	};

	KeyRecognizer.prototype.__keyDownListener = function(ev) {
		var keys = [];
		keys.push(ev.keyCode);

		if (ev.keyCode !== KEYCODE.SHIFT && ev.shiftKey) keys.push(KEYCODE.SHIFT);
		if (ev.keyCode !== KEYCODE.ALT && ev.altKey) keys.push(KEYCODE.ALT);
		if (ev.keyCode !== KEYCODE.CTRL && ev.ctrlKey) keys.push(KEYCODE.CTRL);
		if (ev.keyCode !== KEYCODE.CMD && ev.metaKey) keys.push(KEYCODE.CMD);

		keys.sort(function(a, b) {
			return a - b
		});
		this.fire(keys.join("+"), ev);
	};

	KeyRecognizer.prototype.register = function(pattern, callback, context) {
		if (typeof pattern === "object") {
			var patternList = arguments[0],
				context = arguments[1],
				callback = null;

			for (var pattern in patternList) {
				if (!patternList.hasOwnProperty(pattern)) continue
				this.register(pattern, patternList[pattern], context);
			}
			return
		}

		var tokens = pattern.split("+"),
			keys = [],
			token;

		while (token = tokens.pop()) {
			token = token.toUpperCase();
			if (token in KEYCODE) keys.push(KEYCODE[token]);
		}

		keys.sort(function(a, b) {
			return a - b
		});

		var pattern = keys.join("+");

		this.bind(pattern, callback, context);
	};

	return KeyRecognizer;
}());
