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
		var regCssNoUnit = /^(?:opacity|z-index)$/;

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

				return getComputedStyle(this[0])[key];

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
		this.scheme.push("_" + name);
	};

	return Model;
}());

var ModelTest = (function() {
	function ModelTest() {

	};
	extendClass(ModelTest, Model);

	ModelTest.__record("name");
	ModelTest.__record("age");
	ModelTest.__record("obj");
	ModelTest.__record("child");

	return ModelTest
}());
;var NoteViewTextboxModel = (function() {
	function NoteViewTextboxModel() {
		this._text = "";
		this.__receiver = null;
	}
	extendClass(NoteViewTextboxModel, Model);

	NoteViewTextboxModel.__record("x");
	NoteViewTextboxModel.__record("y");
	NoteViewTextboxModel.__record("text");
	NoteViewTextboxModel.__record("focus");

	NoteViewTextboxModel.prototype.__receiverInput = function() {
		this.text = this.__receiver.getValue();
	};

	return NoteViewTextboxModel;
}());
;var NoteViewTextbox = (function() {

	function NoteViewTextbox(receiver) {
		this.super();

		this.__$base = $("<div class='NoteViewTextbox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
		this.__$base.bind("mousedown", this.__mousedown, this, true);

		this.__$textLayer = $("<div class='NoteViewTextbox-textLayer'></div>")
		this.__$textLayer.appendTo(this.__$base);

		this.__$cursorLayer = $("<div class='NoteViewTextbox-cursorLayer'></div>")
		this.__$cursorLayer.appendTo(this.__$base);

		this.__dragging = {
			startX: null,
			startY: null,
			startMX: null,
			startMY: null,
		};

		this.__receiver = receiver;
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

		document.body.bind("mousemove", this.__mousemoveForMove, this, true);
		document.body.bind("mouseup", this.__mouseupForMove, this, true);

		this.__startMX = ev.x;
		this.__startMY = ev.y;
		this.__startX = parseInt(this.__$base.css("left"));
		this.__startY = parseInt(this.__$base.css("top"));
	};

	NoteViewTextbox.prototype.__mouseupForMove = function(ev) {
		this.__$base.removeClass("-drag");

		document.body.unbind("mousemove", this.__mousemoveForMove, this, true);
		document.body.unbind("mouseup", this.__mouseupForMove, this, true);
	};

	NoteViewTextbox.prototype.__mousemoveForMove = function(ev) {
		var x = Math.round((this.__startX + (ev.x - this.__startMX)) / GRID_SIZE) * GRID_SIZE,
			y = Math.round((this.__startY + (ev.y - this.__startMY)) / GRID_SIZE) * GRID_SIZE;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		this.model.x = x;
		this.model.y = y;
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
		this.model.focus = true;

		var receiver = this.__receiver;
		receiver.bind("blur", this.lostFocus, this);
		receiver.bind("input", this.model.__receiverInput, this.model);
		receiver.setValue(this.model.text);

		receiver.setFocus();
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.model.focus = false;

		var receiver = this.__receiver;
		receiver.unbind("blur", this.lostFocus, this);
		receiver.unbind("input", this.model.__receiverInput, this.model);

		if (this.model.text.replace(/\s*/g, "") === "") this.remove();
	};

	/*-------------------------------------------------
	 * update
	 */
	NoteViewTextbox.prototype.update = function() {
		var model = this.model,
			text = model.text,
			html = Markdown.parse(text);

		this.__$base.toggleClass("-edit", model.focus);
		this.__$textLayer.html(html);
		this.setPosition(model.x, model.y);

		this.fire("update", this);
		console.log(this.__receiver.selectionStart, this.__receiver.selectionEnd)
	};

	return NoteViewTextbox;
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
;var NoteViewInputReceiver = (function() {

	function NoteViewInputReceiver() {
		this.__$base = $("<textarea class='NoteViewInputReceiver-base'></textarea>");
		this.__$base.appendTo(document.body);
		this.__$base.bind("input", this.__input, this, true);
		this.__$base.bind("blur", this.__blurTextArea, this, true);

		this.__kr = new KeyRecognizer();
		this.__kr.register({
			"shift+tab": this.__inputDeleteTab,
			"tab": this.__inputTab,
			"enter": this.__inputEnter,
			"up": this.__inputSelectionMove,
			"down": this.__inputSelectionMove,
			"left": this.__inputSelectionMove,
			"right": this.__inputSelectionMove,
			"shift+up": this.__inputSelectionMove,
			"shift+down": this.__inputSelectionMove,
			"shift+left": this.__inputSelectionMove,
			"shift+right": this.__inputSelectionMove,
			"cmd+up": this.__inputSelectionMove,
			"cmd+down": this.__inputSelectionMove,
			"cmd+left": this.__inputSelectionMove,
			"cmd+right": this.__inputSelectionMove
		}, this);
		this.__kr.listen(this.__$base);

		this.selectionStart = -1;
		this.selectionEnd = -1;
	}
	IPubSub.implement(NoteViewInputReceiver.prototype);

	NoteViewInputReceiver.prototype.__input = function(ev) {
		this.syncSelectionRange();
		this.fire("input");
	};

	NoteViewInputReceiver.prototype.__inputTab = function(ev) {
		var val = this.getValue();

		this.setValue(
			val.slice(0, this.selectionStart) +
			"\t" +
			val.slice(this.selectionEnd)
		)

		this.syncSelectionRange(this.selectionStart + 1, this.selectionStart + 1);
		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputDeleteTab = function(ev) {
		var val = this.getValue();

		var lastLine = val.slice(0, this.selectionStart).split("\n").pop(),
			len = lastLine.length,
			indentLevel = lastLine.match(/^\t*/)[0].length;

		if (indentLevel > 0) {
			this.setValue(
				val.slice(0, this.selectionStart - len) +
				lastLine.slice(1) +
				val.slice(this.selectionEnd)
			);

			this.syncSelectionRange(this.selectionStart - 1, this.selectionStart - 1);
			this.fire("input");
		}
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputEnter = function(ev) {
		var val = this.getValue();

		var lastLine = val.slice(0, this.selectionStart).split("\n").pop(),
			indentLevel = lastLine.match(/^\t*/)[0].length;

		this.setValue(
			val.slice(0, this.selectionStart) +
			"\n" + Array(indentLevel + 1).join("\t") +
			val.slice(this.selectionEnd)
		)

		this.syncSelectionRange(this.selectionStart + 1 + indentLevel, this.selectionStart + 1 + indentLevel);
		this.fire("input");
		ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__inputSelectionMove = function(ev) {
		this.syncSelectionRange();
		this.fire("input");
		// ev.preventDefault();
	};

	NoteViewInputReceiver.prototype.__blurTextArea = function(ev) {
		this.lostFocus();
	};

	/*-------------------------------------------------
	 * value
	 */
	NoteViewInputReceiver.prototype.getValue = function() {
		return this.__$base.val();
	};
	NoteViewInputReceiver.prototype.setValue = function(val) {
		return this.__$base.val(val);
	};

	/*-------------------------------------------------
	 * focus
	 */
	NoteViewInputReceiver.prototype.setFocus = function() {
		this.syncSelectionRange();
		this.fire("focus");
		this.__$base.focus(true);
	};

	NoteViewInputReceiver.prototype.lostFocus = function() {
		this.fire("blur");
	};

	/*-------------------------------------------------
	 * Selection Range
	 */
	NoteViewInputReceiver.prototype.syncSelectionRange = function(start, end) {
		if (start !== undefined) {
			this.__$base[0].selectionStart = start;
		}
		if (end !== undefined) {
			this.__$base[0].selectionEnd = end;
		}

		this.selectionStart = this.__$base[0].selectionStart;
		this.selectionEnd = this.__$base[0].selectionEnd;
	};

	return NoteViewInputReceiver;
}());
;var NoteViewPageModel = (function() {

	function NoteViewPageModel() {
		this._textboxes = [];
	}
	extendClass(NoteViewPageModel, Model);

	NoteViewPageModel.__record("textboxes");

	NoteViewPageModel.prototype.appendTextbox = function(model) {
		if (this.textboxes.indexOf(model) === -1) {
			this.textboxes.push(model);
		}

		model.bind("update", this.update, this)

		this.fire("update");
	};

	NoteViewPageModel.prototype.removeTextbox = function(model) {
		var index = this.textboxes.indexOf(model);
		if (index === -1) return;
		this.textboxes.splice(index, 1);

		model.unbind("update", this.update, this)

		this.fire("update");
	};

	NoteViewPageModel.prototype.update = function() {
		this.fire("update");
	};

	return NoteViewPageModel;
}());
;GRID_SIZE = 20;
var NoteView = (function() {

	function NoteView(model) {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.receiver = new NoteViewInputReceiver();
	}
	extendClass(NoteView, View);

	NoteView.prototype.bindModel = function(model) {
		this.__$base.children().remove();

		this.model = model;
		model.view = this;

		this.model.bind("update", this.update, this);

		var models = model.textboxes;
		for (var i = 0, max = models.length; i < max; i++) {
			this.__addTextbox(models[i]);
		}

		this.update();
	};

	NoteView.prototype.__click = function(ev) {
		var textbox = this.__addTextbox(),
			x = Math.round(ev.offsetX / GRID_SIZE) * GRID_SIZE - 30,
			y = Math.round(ev.offsetY / GRID_SIZE) * GRID_SIZE - 50;

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		textbox.model.x = x;
		textbox.model.y = y;
		textbox.setFocus();
	};

	NoteView.prototype.__addTextbox = function(model) {
		var model = model || new NoteViewTextboxModel(),
			textbox = new NoteViewTextbox(this.receiver);

		textbox.bindModel(model);
		textbox.appendTo(this);
		this.model.appendTextbox(model);

		textbox.bind("remove", this.__removeTextbox, this);

		return textbox;
	};

	NoteView.prototype.__removeTextbox = function(textbox) {
		this.model.removeTextbox(textbox.model);
	};

	NoteView.prototype.update = function() {
		this.fire("update");
	};

	return NoteView;
}());
;;var AlertView = (function() {

	function AlertView() {
		this.super();

		this.__$base = $("<div class='AlertView-base'></div>");

		this.__$text = $("<span class='AlertView-text'></span>");
		this.__$text.appendTo(this.__$base)
	}
	extendClass(AlertView, View);

	AlertView.prototype.show = function(text, duration) {
		this.__$text.text(text);
		this.__$base.addClass("-show");

		var that = this;
		setTimeout(function() {
			that.hide()
		}, duration || 3000);
	};

	AlertView.prototype.showError = function(text, duration) {
		this.__$base.addClass("-error");
		this.show(text, duration);
	};

	AlertView.prototype.hide = function(text) {
		this.__$base.removeClass("-show");
		this.__$base.removeClass("-error");
	};

	return AlertView;
}());
;var DialogView = (function() {

	function DialogView() {
		this.super();

		this.__$outer = $("<div class='DialogView-outer'></div>");
		this.__$outer.bind("click", this.__clickOuter, this, true);

		this.__$base = $("<div class='DialogView-base'></div>");
		this.__$base.appendTo(this.__$outer);
		this.__$base.bind("click", this.__clickBase, this, true);

		this.__$header = $("<header class='DialogView-header'></header>");
		this.__$header.appendTo(this.__$base);

		this.__$title = $("<span class='DialogView-title'>ダイアログタイトル</span>");
		this.__$title.appendTo(this.__$header);

		this.__$body = $("<div class='DialogView-body'></div>");
		this.__$body.appendTo(this.__$base);

		this.__$footer = $("<footer class='DialogView-footer'></footer>");
		this.__$footer.appendTo(this.__$base);

		this.__btnCancel = new ButtonView("Cancel");
		this.__btnCancel.appendTo(this.__$footer);
		this.__btnCancel.bind("click", this.__clickBtnCancel, this);

		this.__btnOK = new ButtonView("OK");
		this.__btnOK.appendTo(this.__$footer);
		this.__btnOK.bind("click", this.__clickBtnOK, this);
	}
	extendClass(DialogView, View);

	//override
	DialogView.prototype.append = DialogView.prototype.appendChild = function(child) {
		child.appendTo(this.__$body);
	};

	//override
	DialogView.prototype.appendTo = function(parent) {
		parent.appendChild(this.__$outer);
	};

	/*-------------------------------
	 * イベントハンドラ
	 */
	DialogView.prototype.__clickOuter = function(ev) {
		ev.stopPropagation();
		this.fire("cancel", this.fire);
		this.fadeOut();
	};

	DialogView.prototype.__clickBase = function(ev) {
		ev.stopPropagation();
	};

	DialogView.prototype.__clickBtnOK = function(ev) {
		ev.stopPropagation();
		this.fire("success", this.fire);
		this.fadeOut();
	};

	DialogView.prototype.__clickBtnCancel = function(ev) {
		ev.stopPropagation();
		this.fire("cancel", this.fire);
		this.fadeOut();
	};

	/*-------------------------------
	 * 表示非表示
	 */
	DialogView.prototype.show = function() {
		this.__$outer.addClass("-show");
		this.__$outer.css("opacity", "");
	};

	DialogView.prototype.hide = function() {
		this.__$outer.removeClass("-show");
		this.__$outer.css("opacity", "");
	};

	DialogView.prototype.fadeOut = function() {
		this.__$outer.animate(function(x) {
			this.css("opacity", 1.0 - x);
		}, 100);
		this.__$outer.one("AnimationCompleted", this.hide, this);
	};

	DialogView.prototype.fadeIn = function() {
		this.__$outer.css("opacity", 0);
		this.__$outer.addClass("-show");
		this.__$outer.animate(function(x) {
			this.css("opacity", x);
		}, 100);
		this.__$outer.one("AnimationCompleted", this.show, this);
	};

	DialogView.prototype.title = function(title) {
		this.__$title.text(title);
	}

	return DialogView;
}());
;var NewFileDialogView = (function() {

	function NewFileDialogView() {
		this.super();
		this.title("新規ファイル名を入力");

		this.__$input = "";
	}
	extendClass(NewFileDialogView, DialogView);

	return NewFileDialogView;
}());
;/*
test data

{"type":"NoteViewPageModel","value":{"_textboxes":{"type":"array","value":[{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":0},"_text":{"type":"native","value":"#Marknote\nマークダウンで手軽に綺麗にノートをとれるウェブアプリ\n===\nver. 0.1.1\n"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":160},"_text":{"type":"native","value":"\t#実装済みの機能\n\t-テキストエディット(カーソルが表示されない)\n\t\t-対応しているmarkdown記法\n\t\t\t-#ヘッダ\n\t\t\t--箇条書き\n\t-テキストボックスの再配置\n\t-セーブ/ロード\n"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":560},"_y":{"type":"native","value":320},"_text":{"type":"native","value":"\t#プロジェクトの情報\n-開発者 きくらげ(twitter: @mr_temperman)\n-\tgithub https://github.com/kikura-yuichiro/marknote"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":530},"_y":{"type":"native","value":330},"_text":{"type":"native","value":" "},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":560},"_y":{"type":"native","value":0},"_text":{"type":"native","value":"\t#使い方\n\t普通にノートが取れる。\n\t\n\t文頭に以下の記号を用いると特殊なスタイルに変換される\n\t-# ヘッダ\n\t\t-ヘッダは#1コしか認識しない\n\t\t-ヘッダのレベルはタブインデントにより制御する\n\t-- 箇条書き\n\t\t-こちらも同じくタブインデントでレベルを制御"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":420},"_text":{"type":"native","value":"\t#今後つくろうと思っている機能\n\t-markdown記法の拡張\n\t\t-(画像)[url]による画像の挿入\n\t\t-表組み機能\t\n\t\t\t-表組みはmarkdownとしてではなく実装したい\n\t\n\t-Export機能\n\t\t-PDF/HTML/MD\n\t-ブック管理機能\n\t"},"_focus":{"type":"native","value":false}}}]}}}

*/

var app = (function() {

	var app = {};

	app.init = function() {
		var toolbar = new ToolbarView();
		toolbar.setID("toolbar");
		toolbar.append($("#logo"));
		toolbar.insertBefore($("#maincontainer"));
		app.toolbar = toolbar;

		var btnNewFile = new ButtonView("新規作成(&#8963;&#8984;N)");
		btnNewFile.appendTo(toolbar);
		btnNewFile.bind("click", app.newFile, this);
		app.btnNewFile = btnNewFile;

		var btnOpen = new ButtonView("開く(&#8984;O)");
		btnOpen.appendTo(toolbar);
		btnOpen.bind("click", app.openFile, app);
		app.btnOpen = btnOpen;

		var btnSave = new ButtonView("保存(&#8984;S)");
		btnSave.appendTo(toolbar);
		btnSave.bind("click", app.saveFile, app);
		app.btnSave = btnSave;

		var btnImport = new ButtonView("Import");
		btnImport.appendTo(toolbar);
		btnImport.bind("click", app.importFile, app);
		app.btnImport = btnImport;

		var btnExport = new ButtonView("Export");
		btnExport.appendTo(toolbar);
		btnExport.bind("click", app.exportFile, app);
		app.btnExport = btnExport;

		var sideMenu = new SideMenuView();
		sideMenu.setID("sidemenu");
		sideMenu.__$base.css("marginLeft", -200);
		sideMenu.appendTo($("#maincontainer"));
		app.sideMenu = sideMenu;

		var btnToggleSideMenu = new ButtonView("メニューの開閉(&#8963;&#8984;T)");
		btnToggleSideMenu.appendTo(toolbar);
		btnToggleSideMenu.bind("click", app.toggleSideMenu, app);
		app.btnToggleSideMenu = btnToggleSideMenu;

		var noteView = new NoteView();
		noteView.setID("noteview");
		noteView.appendTo($("#maincontainer"));
		app.noteView = noteView;

		var kr = new KeyRecognizer();
		kr.listen(document.body);
		kr.register({
			"cmd+S": app.saveFile,
			"cmd+O": app.openFile,
			"ctrl+cmd+N": app.newFile,
			"ctrl+cmd+T": app.toggleSideMenu,
		}, app);
		app.kr = kr;

		var alertView = new AlertView();
		alertView.appendTo($("body"));
		app.alertView = alertView;
	};

	app.saveFile = function(ev) {
		app.noteView.model.save("test");
		app.alertView.show("保存しました");
		if (ev) ev.preventDefault();
	};

	app.openFile = function(ev) {
		var savedata = Model.load("test");
		if (!savedata) {
			app.alertView.showError("セーブデータが存在しません");
			return;
		}
		app.noteView.bindModel(savedata);
		app.alertView.show("読み込みました");

		if (ev) ev.preventDefault();
	};

	app.newFile = function(ev) {
		var dialog = new NewFileDialogView()
		dialog.appendTo($("body"));
		dialog.bind("success", app.createNewFile, app);
		dialog.fadeIn();
	};

	app.createNewFile = function(fileName) {
		app.alertView.show("新規作成");
		app.noteView.bindModel(new NoteViewPageModel());
	};

	app.importFile = function(ev) {
		app.alertView.show("Import(未実装)");

		if (ev) ev.preventDefault();
	};

	app.exportFile = function(ev) {
		app.alertView.show("Export(未実装)");

		if (ev) ev.preventDefault();
	};

	app.toggleSideMenu = function(ev) {
		var sideMenu = app.sideMenu;

		if (sideMenu.__$base.css("marginLeft") === "-200px") {
			sideMenu.__$base.animate(function(x) {
				this.css("marginLeft", -200 * (1 - x * x) + "px");
			}, 100);
		} else {
			sideMenu.__$base.animate(function(x) {
				this.css("marginLeft", -200 * x * x + "px");
			}, 100);
		}
	};

	window.bind("DOMContentLoaded", app.init, app, true);

	return app;
}());
;