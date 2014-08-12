;(function(exports) {

	exports.extend = function(target, srces) {
		for (var i = 1, max = arguments.length; i < max; i++) {
			var src = arguments[i];

			for (var key in src) {
				if (!src.hasOwnProperty(key)) continue;
				target[key] = src[key];
			}
		}

		return target;
	};

	exports.extendClass = function(childClass, superClass) {
		childClass.prototype = new superClass();
		childClass.prototype.constructor = childClass;

		for (var i in superClass) {
			if (!superClass.hasOwnProperty(i)) continue;
			childClass[i] = superClass[i];
		}
	};

	function getPrototype(target) {
		return target.__proto__;
	};

	function searchTrueContext(fakeContext, func) {
		for (var key in fakeContext) {
			if (!fakeContext.hasOwnProperty(key)) continue;
			if (fakeContext[key] === func) return fakeContext
		}
		var proto = getPrototype(fakeContext);
		return proto ? searchTrueContext(proto, func) : null;
	};

	Object.prototype.super = function(funcName) {
		var args = [];
		args.push.apply(args, arguments);
		args.shift();

		var fakeContext = this,
			trueContext = searchTrueContext(fakeContext, arguments.callee.caller);
		if (!trueContext) throw new Error("Can't get true context.");

		var superContext = getPrototype(trueContext),
			superMethod = funcName ? superContext[funcName] : superContext.constructor;

		if (typeof superMethod !== "function") return;

		return superMethod.apply(fakeContext, args);
	};

	exports.KEYCODE = {
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		SPACE: 32,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		DELETE: 46,
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,
		CMD: 91,
		MULTIBYTE_MODE: 229
	};

}(this));
;var IPubSub = (function(exports) {

	var callbackDict = {};
	var nativeCallbackDict = {};
	var guid = 0;

	function getPublihserId(target, flagCreate) {
		return target._publisherID || (flagCreate ? target._publisherID = ++guid : undefined);
	}

	exports.bind = function(publisher, type, fn, context, isNative) {
		//Prevent for register duplication
		exports.unbind(publisher, type, fn, context);

		var publisherID = getPublihserId(publisher, true);

		var callbackList = callbackDict[publisherID];
		if (!callbackList) {
			callbackList = callbackDict[publisherID] = {};
		}

		var callbacks = callbackList[type];
		if (!callbacks) {
			callbacks = callbackList[type] = [];
		}

		if (isNative) {
			var nativeCallbackList = nativeCallbackDict[publisherID];
			if (!nativeCallbackList) {
				nativeCallbackList = nativeCallbackDict[publisherID] = {};
			}

			var nativeCallback = nativeCallbackList[type];
			if (!nativeCallback) {
				nativeCallback = nativeCallbackList[type] = function(ev) {
					this.fire(type, ev);
				};

				publisher.addEventListener(type, nativeCallback);
			}
		}

		callbacks.push({
			context: context,
			fn: fn,
		});
	}

	exports.one = function(publisher, type, fn, context) {
		IPubSub.bind(publisher, type, function() {
			fn.apply(this, arguments);
			IPubSub.unbind(publisher, type, arguments.callee, context);
		}, context);
	};

	exports.unbind = function(publisher, type, fn, context) {
		var publisherID = getPublihserId(publisher);
		if (!publisherID) return;

		var callbackList = callbackDict[publisherID];
		if (!callbackList) return

		var callbacks = callbackList[type];
		if (!callbacks) return

		for (var i = 0, max = callbacks.length; i < max; i++) {
			var callback = callbacks[i];

			if (callback.fn === fn &&
				callback.context === context) {
				callbacks.splice(i, 1);
				i--;
				max--;
			}
		}

		if (callbacks.length > 0) return

		//remove nativeCallback
		var nativeCallbackList = nativeCallbackDict[publisherID];
		if (nativeCallbackList) {
			var nativeCallback = nativeCallbackList[type];
			if (nativeCallback) {
				publisher.removeEventListener(type, nativeCallback);
				nativeCallback = nativeCallbackList[type] = null;
			}
		}
	};

	exports.fire = function(publisher, type, argArr) {
		var publisherID = getPublihserId(publisher);
		if (!publisherID) return;

		var callbackList = callbackDict[publisherID];
		if (!callbackList) return

		var callbacks = callbackList[type];
		if (!callbacks) return

		argArr = argArr || [];

		var firedArr = [];

		var callback;
		while (callback = callbacks[0]) {
			callback.fn.apply(callback.context || publisher, argArr);
			if (callbacks[0] === callback) {
				firedArr.push(callbacks.shift());
			}
		}

		callbackList[type] = firedArr;
	};

	exports.implement = function(target) {
		target.bind = function(type, fn, context, isNative) {
			IPubSub.bind(this, type, fn, context, isNative);
			return this;
		};
		target.one = function(type, fn, context) {
			IPubSub.one(this, type, fn, context);
			return this;
		};
		target.unbind = function(type, fn, context) {
			IPubSub.unbind(this, type, fn, context);
			return this;
		};
		target.fire = function(type) {
			var args = [];
			args.push.apply(args, arguments);
			args.shift();
			IPubSub.fire(this, type, args);
			return this;
		};
	};

	return exports;
}({}));
;var bQuery = (function() {

	function bQuery() {}
	IPubSub.implement(bQuery.prototype);
	IPubSub.implement(HTMLElement.prototype);
	IPubSub.implement(window);

	extend(bQuery.prototype, {
		bind: function(type, fn, context, isNative) {
			this.map(function(node) {
				IPubSub.bind(node, type, fn, context, isNative);
			});
			return this;
		},
		one: function(type, fn, context) {
			this.map(function(node) {
				IPubSub.one(node, type, fn, context);
			});
			return this;
		},
		unbind: function(type, fn, context) {
			this.map(function(node) {
				IPubSub.unbind(node, type, fn, context);
			});
			return this;
		},
		fire: function(type) {
			var args = [];
			args.push.apply(args, arguments);
			args.shift();

			this.map(function(node) {
				IPubSub.fire(node, type, args);
			});
			return this;
		}
	});

	var parseHTML = (function() {
		var parsePool = document.createElement("div");

		return function parseHTML(html) {
			parsePool.innerHTML = html;
			return (new bQuery()).merge(parsePool.children);
		}
	}())

	extend(bQuery.prototype, {
		length: 0,
		push: Array.prototype.push,
		pop: Array.prototype.pop,
		shift: Array.prototype.shift,
		unshift: Array.prototype.unshift,
		indexOf: Array.prototype.indexOf,
		splice: Array.prototype.splice,
		merge: function(arr) {
			for (var i = 0, max = arr.length; i < max; i++) {
				if (this.indexOf(arr[i]) >= 0) continue;
				this.push(arr[i]);
			}
			return this;
		},
		map: function(fn) {
			for (var i = 0, max = this.length; i < max; i++) {
				fn(this[i]);
			}
			return this;
		},
		find: function(query) {
			var res = $();

			this.map(function(node) {
				res.merge(node.querySelectorAll(query));
			});

			return res;
		}
	});

	window.$ = function(query) {
		if (arguments.length == 0) {
			return new bQuery();
		} else if (typeof query === "string") {
			if (query.trim().charAt(0) === "<") {
				return parseHTML(query);
			} else {
				return (new bQuery()).merge(document.querySelectorAll(query));
			}
		} else {
			if (query instanceof bQuery) {
				return query
			} else if (query instanceof HTMLElement) {
				var res = new bQuery();
				res.push(query);
				return res;
			}
		}

		return null;
	};

	return bQuery;
}());
;(function() {
	extend(bQuery.prototype, {
		append: function(children) {
			return this.appendChild(children);
		},
		appendChild: function(children) {
			var that = this;
			$(children).map(function(child) {
				that[0].appendChild(child);
			});
			return this;
		},
		appendTo: function(parent) {
			$(parent).appendChild(this);
			return this;
		},
		insertBefore: function(refElement) {
			var refElement = $(refElement)[0],
				parent = refElement.parentNode;

			this.map(function(child) {
				parent.insertBefore(child, refElement);
			});

			return this;
		},
		insertAfter: function(refElement) {
			var refElement = $(refElement);

			this.insertBefore(refElement);
			refElement[0].parentNode.insertBefore(refElement[0], this[0]);

			return this;
		},
		remove: function() {
			this.map(function(child) {
				if (!child.parentNode) return;
				child.parentNode.removeChild(child);
			});
			return this;
		},
		parent: function() {
			return $(this[0].parentNode);
		},
		children: function() {
			return $().merge(this[0].children);
		}
	});
}());
;(function() {
	var cssValueNormalize = (function() {
		var regCssNoUnit = /^(?:opacity|zIndex)$/;

		return function cssValueNormalize(key, value) {
			if (typeof value === "number" &&
				!regCssNoUnit.test(key)) {
				value = "" + value + "px";
			}
			return value;
		};
	}());

	extend(bQuery.prototype, {
		css: function(key, value) {
			if (typeof key === "object") {

				var param = key;
				for (var key in param) {
					if (!param.hasOwnProperty(key)) continue;
					this.css(key, param[key]);
				}

			} else if (arguments.length === 1) {

				var val = getComputedStyle(this[0])[key],
					valAsNumber = parseFloat(val);

				if (val !== NaN) {
					return valAsNumber
				} else {
					return val
				}

			} else {

				value = cssValueNormalize(key, value);
				this.map(function(node) {
					node.style[key] = value;
				});

			}
			return this;
		},
		hide: function() {
			return this.css("display", "none");
		},
		show: function() {
			return this.map(function(node) {
				node.style.display = "";
				var style = getComputedStyle(node);

				if (style.display == "none") {
					node.style.display = "block";
				}
				if (parseInt(node.opdacity) == 0) {
					node.style.opacity = 1;
				}
			});
		}
	});
}());
;(function() {
	extend(bQuery.prototype, {
		addClass: function(klass) {
			this.map(function(node) {
				node.classList.add(klass);
			});
			return this
		},
		removeClass: function(klass) {
			this.map(function(node) {
				node.classList.remove(klass);
			});
			return this
		},
		toggleClass: function(klass, flag) {
			if (arguments.length == 2) {
				if (flag) {
					return this.addClass(klass)
				} else {
					return this.removeClass(klass)
				}
			} else {
				this.map(function(node) {
					node.classList.toggle(klass);
				});
			}
			return this
		},
		hasClass: function(klass) {
			return this[0].classList.contains(klass);
		}
	});
}());
;(function() {
	extend(bQuery.prototype, {
		text: function(t) {
			if (t === undefined) {
				return this[0].innerText;
			}

			return this.map(function(node) {
				node.innerText = t;
			});
		},
		html: function(t) {
			if (t === undefined) {
				return this[0].innerHTML;
			}

			return this.map(function(node) {
				node.innerHTML = t;
			});
		},
		val: function(t) {
			if (t === undefined) {
				return this[0].value;
			}

			return this.map(function(node) {
				node.value = t;
			});
		},
		setAttribute: function(key, val) {
			return this.map(function(node) {
				node.setAttribute(key, val);
			});
		},
		getAttribute: function(key) {
			return this[0].getAttribute(key);
		},
		attr: function(key, val) {
			if (arguments.length === 1) {
				return this.getAttribute(key);
			} else {
				return this.setAttribute(key, val);
			}
		},
		focus: function(flag) {
			return this.map(function(node) {
				node.focus(flag);
			});
		}
	});
}());
;(function() {
	extend(bQuery.prototype, {
		animate: function(fn, duration) {

			var that = this,
				core = function() {
					var n = +(new Date()),
						x = (n - s > duration) ? 1 : (n - s) / duration;

					fn.call(that, x);

					if (x >= 1) {
						that.fire("AnimationCompleted");
						delete s;
						delete core;
						delete fn;
						delete duration;
						delete that;
						return;
					}

					requestAnimationFrame(core);
				};

			var s = +(new Date());
			requestAnimationFrame(core);

			return this;
		}
	});

	extend(bQuery.prototype, {
		fadeIn: function(duration) {
			this.animate(function(x) {
				this.css("opacity", x);
			}, duration);

			return this;
		},
		fadeOut: function(duration) {
			this.animate(function(x) {
				this.css("opacity", 1 - x);
			}, duration);

			return this;
		}
	});
}());
;;var View = (function() {

	function View() {

	}
	IPubSub.implement(View.prototype);

	View.prototype.append = View.prototype.appendChild = function(child) {
		child.appendTo(this.__$base);
	};

	View.prototype.appendTo = function(parent) {
		parent.appendChild(this.__$base);
	};

	View.prototype.insertBefore = function(refElement) {
		this.__$base.insertBefore(refElement);
	};

	View.prototype.insertAfter = function(refElement) {
		this.__$base.insertAfter(refElement);
	};

	View.prototype.setID = function(id) {
		this.__$base.attr("id", id);
	};

	View.prototype.setPosition = function(left, top) {
		this.__$base.css({
			top: top,
			left: left
		});
	};

	View.prototype.setSize = function(width, height) {
		this.__$base.css({
			width: width,
			height: height
		});
	};

	View.prototype.setWidth = function(width) {
		this.__$base.css("width", width);
	};

	View.prototype.setHeight = function(height) {
		this.__$base.css("height", height);
	};

	return View;
}());
;var ToolbarView = (function() {

	function ToolbarView() {
		this.super();

		this.__$base = $("<div class='ToolbarView-base'></div>");
	}
	extendClass(ToolbarView, View);

	return ToolbarView;
}());
;var TabView = (function() {

	function TabView() {
		this.super();

		this.__$base = $("<div class='TabView-base'></div>");

		this.__$headerContainer = $("<ul class='TabView-headerContainer'></div>");
		this.__$headerContainer.appendTo(this.__$base);

		this.__$panelContainer = $("<div class='TabView-panelContainer'></div>");
		this.__$panelContainer.appendTo(this.__$base);

		this.__panels = [];
		this.__activePanelIndex = null;

		this.addPanel("タブ");
		this.activatePanel(0);
	}
	extendClass(TabView, View);

	TabView.prototype.addPanel = function(name) {
		var panel = new TabPanelView(name);

		panel.__$header.appendTo(this.__$headerContainer);
		panel.__$base.appendTo(this.__$panelContainer);

		panel.bind("click", this.__clickPanel, this);
		this.__panels.push(panel);

		return panel;
	};

	TabView.prototype.getPanel = function(index) {
		return this.__panels[index];
	};

	TabView.prototype.activatePanel = function(index) {
		if (this.__activePanelIndex !== null) {
			this.__panels[this.__activePanelIndex].__deactivate();
			this.__activePanelIndex = null;
		}

		this.__panels[index].__activate();
		this.__activePanelIndex = index;
	};

	TabView.prototype.__clickPanel = function(ev, panel) {
		var i = 0
		for (i = 0, max = this.__panels.length; i < max; i++)
			if (this.__panels[i] === panel) break;

		if (i === this.__panels.length) {
			return;
		}

		this.activatePanel(i);
	};

	return TabView;
}());

var TabPanelView = (function() {

	function TabPanelView(name) {
		this.super();

		this.__$base = $("<div class='TabPanelView-base'></div>");

		this.__$header = $("<div class='TabPanelView-header'></div>");

		this.__$name = $("<span class='TabPanelView-name'>タブ</span>");
		this.__$name.appendTo(this.$header);

		this.__$header.bind("click", this.__clickHeader, this, true);

		this.name = name;
	}
	extendClass(TabPanelView, View);

	TabPanelView.prototype.__defineSetter__("name", function(_name) {
		this.__$name.text(_name);
	});
	TabPanelView.prototype.__defineGetter__("name", function() {
		return this.__$name.text();
	});

	TabPanelView.prototype.__activate = function() {
		this.__$base.addClass("-active");
		this.__$header.addClass("-active");
	};

	TabPanelView.prototype.__deactivate = function() {
		this.__$base.removeClass("-active");
		this.__$header.removeClass("-active");
	};

	TabPanelView.prototype.__clickHeader = function(ev) {
		this.fire("click", ev, this);
	};

	return TabPanelView;
}());
;var SideMenuView = (function() {

	function SideMenuView() {
		this.super();

		this.__$base = $("<div class='SideMenuView-base'></div>");

	}
	extendClass(SideMenuView, View);

	return SideMenuView;
}());
;var ButtonView = (function() {

	function ButtonView(title) {
		this.super();

		this.__$base = $("<button class='ButtonView-base'>" + title + "</button>");
		this.__$base.bind("click", this.__click, this, true);
	}
	extendClass(ButtonView, View);

	ButtonView.prototype.__click = function(ev) {
		this.fire("click", ev, this);
	};

	return ButtonView;
}());
;var Markdown = (function() {
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
;var Model = (function() {
	function Model() {

	}
	IPubSub.implement(Model.prototype);

	Model.prototype.save = function(key) {
		localStorage.setItem(key, JSON.stringify(this.convertToNativeObject()));
	};

	Model.load = function(key) {
		return Model.convertFromNativeObject(JSON.parse(localStorage.getItem(key)));
	};

	Model.prototype.convertToNativeObject = function() {
		var scheme = this.constructor.scheme,
			res = {
				type: this.constructor.name,
				value: {}
			};

		if (!scheme) {
			return {};
		};


		for (var i = 0, max = scheme.length; i < max; i++) {
			var propName = scheme[i],
				val = this[propName];

			res.value[propName] = convertToNativeObject(val);
		}

		return res;
	}

	function convertToNativeObject(val) {
		var res;

		if (val instanceof Model) {

			res = val.convertToNativeObject();

		} else if (val instanceof Array) {

			arr = [];
			for (var j = 0, max2 = val.length; j < max2; j++) {
				arr.push(convertToNativeObject(val[j]));
			}
			res = {
				type: "array",
				value: arr
			};

		} else if (val instanceof Object) {

			obj = {};
			for (var j in val) {
				if (!val.hasOwnProperty(j)) continue;
				obj[j] = convertToNativeObject(val[j]);
			}
			res = {
				type: "object",
				value: obj
			};

		} else {

			res = {
				type: "native",
				value: val
			};

		}

		return res;
	}

	Model.convertFromNativeObject = function(data) {
		var res;

		if (!data) return undefined;

		switch (data.type) {
			case "native":
				res = data.value;
				break;

			case "array":
				res = [];
				for (var i = 0, max = data.value.length; i < max; i++) {
					res.push(Model.convertFromNativeObject(data.value[i]));
				}
				break;

			case "object":
				res = {};
				for (var key in data.value) {
					if (!data.value.hasOwnProperty(key)) continue
					res[key] = Model.convertFromNativeObject(data.value[key]);
				}
				break;

			default:
				res = new window[data.type]();
				for (var key in data.value) {
					if (!data.value.hasOwnProperty(key)) continue
					res[key] = Model.convertFromNativeObject(data.value[key]);
				}
				break;

		}

		return res;
	}

	Model.__record = function(name, getter, setter) {
		this.prototype.__defineGetter__(name, getter || function() {
			return this["_" + name];
		});
		this.prototype.__defineSetter__(name, function(value) {
			if (setter) {
				setter.call(this, value);
			} else {
				this["_" + name] = value
			}
			this.fire("update");
		});

		if (!this.scheme) this.scheme = [];
		this.scheme.push(name);
	};

	return Model;
}());
;var NoteViewTextboxModel = (function() {
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
;var KeyRecognizer = (function() {

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
;var BLINK_INTERVAL = 500;

var NoteViewCursorView = (function() {

	function NoteViewCursorView(receiver) {
		this.super();

		this.__$base = $("<div class='NoteViewCursorView-base'></div>");
		this.__blinkTimerID = null;

		this.__$inputReceiver = $("<input type='text' />");
		this.__$inputReceiver.appendTo($("body"));
		this.__$inputReceiver.bind("blur", this.__blur, this, true);
		this.__$inputReceiver.bind("input", this.__input, this, true);

		this.__kr = new KeyRecognizer();
		this.__kr.listen(this.__$inputReceiver);
		this.__kr.register({
			"up": this.__inputMoveUp,
			"down": this.__inputMoveDown,
			"left": this.__inputMoveLeft,
			"right": this.__inputMoveRight
		}, this)

		//debug only start
		this.__$inputReceiver.css({
			display: "fixed",
			bottom: 0,
			left: 0,
			zIndex: 65535
		});
		//debug only end

		this.selection = {
			start: {
				row: 0,
				column: 0
			},
			end: {
				row: 0,
				column: 0
			}
		};

		this.targetTextBox = null;
	}

	extendClass(NoteViewCursorView, View);


	/*-------------------------------------------------
	 *	Event Handler
	 */
	NoteViewCursorView.prototype.__textBoxUpdate = function() {
		this.update();
	};

	NoteViewCursorView.prototype.__blur = function(ev) {
		this.fire("blur");
	};

	NoteViewCursorView.prototype.__input = function(ev) {
		this.inputText(this.__$inputReceiver.val());
		this.__$inputReceiver.val("");
	};

	NoteViewCursorView.prototype.__inputMoveUp = function(ev) {
		this.selection.start.row--;
		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveDown = function(ev) {
		this.selection.start.row++;
		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveLeft = function(ev) {
		this.selection.start.column--;
		if (this.selection.start.column < 0) {
			if (this.selection.start.row === 0) {
				this.selection.start.column = 0
			} else {
				this.selection.start.row--;
				this.selection.start.column = this.targetTextBox.model.getLine(this.selection.start.row).length
			}
		}

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	};

	NoteViewCursorView.prototype.__inputMoveRight = function(ev) {
		this.selection.start.column++;
		if (this.selection.start.column > this.targetTextBox.model.getLineLength(this.selection.start.row)) {
			if (this.selection.start.row === this.targetTextBox.model.getLinesCount()) {
				this.selection.start.column = this.targetTextBox.model.getLineLength()
			} else {
				this.selection.start.row++;
				this.selection.start.column = 0;
			}
		}

		this.selection.end.row = this.selection.start.row;
		this.selection.end.column = this.selection.start.column;

		this.__selectionNormalize();
	}
	/*-------------------------------------------------
	 *	Input
	 */
	NoteViewCursorView.prototype.inputText = function(text) {
		if (!this.targetTextBox) return;

		var start = this.selection.start,
			end = this.selection.end;

		this.targetTextBox.model.splice(start, end, text);

		end.row = start.row;
		end.column = start.column += text.length;

		this.__selectionNormalize();
	};

	/*-------------------------------------------------
	 *	attach/detach
	 */
	NoteViewCursorView.prototype.attach = function(textbox) {
		this.targetTextBox = textbox;
		this.appendTo(textbox.__$cursorLayer);
		textbox.bind("update", this.__textBoxUpdate, this);

		this.bind("blur", textbox.lostFocus, textbox);
		this.__$inputReceiver.focus();
	};

	NoteViewCursorView.prototype.detach = function(textbox) {
		this.targetTextBox = null;
		textbox.unbind("update", this.__textBoxUpdate, this);

		this.unbind("blur", textbox.lostFocus, textbox);
		this.hide();
	};

	/*-------------------------------------------------
	 *	visiblity
	 */
	NoteViewCursorView.prototype.hide = function() {
		if (this.__blinkTimerID) {
			clearInterval(this.__blinkTimerID);
			this.__blinkTimerID = null;
		}

		this.__$base.removeClass("-show");
	};

	NoteViewCursorView.prototype.show = function() {
		if (!this.__blinkTimerID) {
			var that = this;
			this.__blinkTimerID = setInterval(function() {
				that.blink();
			}, BLINK_INTERVAL);
		}

		this.__$base.addClass("-show");
	};

	NoteViewCursorView.prototype.blink = function() {
		this.__$base.toggleClass("-show");
	};

	/*-------------------------------------------------
	 *	selection
	 */
	NoteViewCursorView.prototype.__selectionNormalize = function() {
		if (!this.targetTextBox) return;

		var start = this.selection.start,
			end = this.selection.end;
		this.__positionNormalize(start);
		this.__positionNormalize(end);

		//swap if start is after than end
		if (start.row > end.row || (start.row === end.row && start.column > end.column)) {
			var tmp = start.row
			start.row = end.row;
			end.row = tmp;

			tmp = start.column;
			start.column = end.column;
			end.column = tmp;
		}

		this.update();
	};

	NoteViewCursorView.prototype.__positionNormalize = function(position) {
		if (!this.targetTextBox) return;

		var lines = this.targetTextBox.model.getLines();

		if (position.row < 0) {
			position.row = 0;
			position.column = 0;
			return;

		} else if (position.row >= lines.length) {
			position.row = lines.length - 1;
			position.column = lines[lines.length - 1].length;
			return;

		}
	};

	/*-------------------------------------------------
	 *	update
	 */
	NoteViewCursorView.prototype.update = function() {
		if (!this.targetTextBox) return;

		var renderingInfo = this.targetTextBox.renderingInfo,
			start = this.selection.start,
			end = this.selection.end,
			x, y, h;

		y = renderingInfo[start.row].top;
		h = renderingInfo[start.row].height;
		x = Math.min(start.column, this.targetTextBox.model.getLineLength(start.row)) * h / 3;

		this.__$base.css({
			left: x,
			top: y,
			height: h
		});

		this.show();
	};

	//指定された座標が論理行で何行目何文字目かを返す
	// NoteViewCursorView.prototype.getCursorPositionByScreenPosition = function(x, y) {
	// 	var lines = this.model.text.split("\n"),
	// 		$lineElements = this.__$textLayer.children(),
	// 		row = 0,
	// 		column = 0;

	// 	//y方向(row)
	// 	for (var max = $lineElements.length; row < max; row++) {
	// 		if (this.renderingInfo[row].top > y) break
	// 	}
	// 	row--;

	// 	//範囲外
	// 	if (row < 0 || row >= lines.length) {
	// 		return {
	// 			row: row,
	// 			column: -1
	// 		};
	// 	}

	// 	//x方向(column)
	// 	var parentScope = $lineElements[row];
	// 	console.dir(parentScope.childNodes[0].childNodes[0])

	// 	return {
	// 		row: row,
	// 		column: column
	// 	};
	// };

	return NoteViewCursorView
}());
;var NoteViewTextbox = (function() {

	function NoteViewTextbox(cursor) {
		this.super();

		this.__$base = $("<div class='NoteViewTextbox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
		this.__$base.bind("mousedown", this.__mousedown, this, true);

		this.__$resizeHandle = $("<div class='NoteViewTextbox-resizeHandle'></div>")
		this.__$resizeHandle.appendTo(this.__$base);
		this.__$resizeHandle.bind("mousedown", this.__mousedownResizeHandle, this, true);

		this.__$textLayer = $("<div class='NoteViewTextbox-textLayer'></div>")
		this.__$textLayer.appendTo(this.__$base);

		this.__$cursorLayer = $("<div class='NoteViewTextbox-cursorLayer'></div>")
		this.__$cursorLayer.appendTo(this.__$base);

		this.cursor = cursor;

		this.renderingInfo = [];
	}
	extendClass(NoteViewTextbox, View);

	NoteViewTextbox.prototype.bindModel = function(model) {
		this.model = model;
		model.view = this;
		model.__receiver = this.__receiver;

		this.model.bind("update", this.update, this);

		this.update();
	};

	/*-------------------------------------------------
	 * Event Handlers
	 */
	NoteViewTextbox.prototype.__click = function(ev) {
		this.setFocus();
		ev.stopPropagation();
	};

	NoteViewTextbox.prototype.__mousedown = function(ev) {
		this.__$base.addClass("-drag");

		document.body.bind("mousemove", this.__mousemove, this, true);
		document.body.bind("mouseup", this.__mouseup, this, true);

		this.__startMX = ev.x;
		this.__startMY = ev.y;
		this.__startX = parseInt(this.__$base.css("left"));
		this.__startY = parseInt(this.__$base.css("top"));

		ev.stopPropagation();
	};

	NoteViewTextbox.prototype.__mouseup = function(ev) {
		this.__$base.removeClass("-drag");

		document.body.unbind("mousemove", this.__mousemove, this, true);
		document.body.unbind("mouseup", this.__mouseup, this, true);
	};

	NoteViewTextbox.prototype.__mousemove = function(ev) {
		var x = Math.round((this.__startX + (ev.x - this.__startMX)) / GRID_SIZE) * GRID_SIZE,
			y = Math.round((this.__startY + (ev.y - this.__startMY)) / GRID_SIZE) * GRID_SIZE;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		this.model.x = x;
		this.model.y = y;
	};

	NoteViewTextbox.prototype.__mousedownResizeHandle = function(ev) {
		this.__$base.addClass("-drag");

		document.body.bind("mousemove", this.__mousemoveResizeHandle, this, true);
		document.body.bind("mouseup", this.__mouseupResizeHandle, this, true);

		this.__startMX = ev.x;
		this.__startW = parseInt(this.model.w);

		ev.stopPropagation();
	};

	NoteViewTextbox.prototype.__mouseupResizeHandle = function(ev) {
		this.__$base.removeClass("-drag");

		document.body.unbind("mousemove", this.__mousemoveResizeHandle, this, true);
		document.body.unbind("mouseup", this.__mouseupResizeHandle, this, true);

		ev.stopPropagation();
	};

	NoteViewTextbox.prototype.__mousemoveResizeHandle = function(ev) {
		var w = this.__startW + Math.round((ev.x - this.__startMX) / GRID_SIZE) * GRID_SIZE;

		if (w < 50) w = 50;

		this.model.w = w;
	};

	/*-------------------------------------------------
	 * remove
	 */
	NoteViewTextbox.prototype.remove = function() {
		this.__$base.remove();

		this.fire("remove", this);
	};

	/*-------------------------------------------------
	 * focus
	 */
	NoteViewTextbox.prototype.setFocus = function() {
		this.cursor.attach(this);

		this.fire("update", this);
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.cursor.detach(this);

		if (this.model.text.replace(/\s*/g, "") === "") this.remove();
	};

	/*-------------------------------------------------
	 * update
	 */
	NoteViewTextbox.prototype.update = function() {
		this.updateBase();
		this.updateTextLayer();

		this.fire("update", this);
	};

	NoteViewTextbox.prototype.updateTextLayer = function() {
		var lines = this.model.text.split("\n"),
			top = 0,
			width = this.model.w;

		this.__$textLayer.children().remove();

		this.renderingInfo = [];
		for (var i = 0, max = lines.length; i < max; i++) {
			var lineRenderingInfo = this.convertLineToHTML(lines[i]);

			this.renderingInfo.push({
				top: top,
				height: lineRenderingInfo.height
			});

			var $line = $(lineRenderingInfo.html);
			this.__$textLayer.append($line);
			$line.css({
				top: top,
				width: width,
				height: lineRenderingInfo.height
			});

			top += lineRenderingInfo.height;
		};
		this.__$textLayer.css("height", top);
	};

	NoteViewTextbox.prototype.updateBase = function() {
		var model = this.model;

		this.__$base.toggleClass("-edit", model.focus);
		this.__$base.css({
			left: model.x,
			top: model.y,
			width: model.w,
			zIndex: model.z
		});
	};

	NoteViewTextbox.prototype.convertLineToHTML = function(line) {
		return {
			html: "<p class='NoteViewTextbox-line'>" + this.wrapWithScope(line) + "</p>",
			height: 20
		}
	};

	NoteViewTextbox.prototype.wrapWithScope = function(text, scope) {
		var scopes = ["NoteViewTextBox-scope"];

		if (scope) scopes = scopes.concat(scope);

		return "<span class='" + scopes.join(" ") + "'>" + text + "</span>"
	};

	return NoteViewTextbox;
}());
