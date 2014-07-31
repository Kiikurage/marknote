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
	}

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
	}

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
	}

	return exports;
}({}));
;var bQuery = (function() {

	function bQuery() {}
	IPubSub.implement(bQuery.prototype);
	IPubSub.implement(HTMLElement.prototype);
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
				res.merge(dom.querySelectorAll(query));
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
				!regCssNoUnit.test(value)) {
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
;var NoteView = (function() {

	function NoteView() {
		this.super();
		this.__$base = $("<div class='NoteView-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
	}
	extendClass(NoteView, View);

	NoteView.prototype.__click = function(ev) {
		var textBox = this.__addNoteViewTextBox(),
			x = Math.round(ev.offsetX / 10) * 10,
			y = Math.round(ev.offsetY / 10) * 10;

		textBox.setPosition(x, y);
		textBox.setFocus();
	};

	NoteView.prototype.__addNoteViewTextBox = function() {
		var textBox = new NoteViewTextBox();
		textBox.appendTo(this);
		return textBox;
	};

	return NoteView;
}());

var NoteViewTextBox = (function() {

	function NoteViewTextBox() {
		this.super();
		this.__$base = $("<div class='NoteViewTextBox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);

		this.__$header = $("<header class='NoteViewTextBox-header'></header>")
		this.__$header.appendTo(this.__$base);

		this.__$textarea = $("<textarea class='NoteViewTextBox-textarea'></textarea>")
		this.__$textarea.appendTo(this.__$base);
		this.__$textarea.bind("input", this.__input, this, true);
		this.__$textarea.bind("blur", this.__blurTextArea, this, true);
	}
	extendClass(NoteViewTextBox, View);

	NoteViewTextBox.prototype.__click = function(ev) {
		this.setFocus();
		ev.stopPropagation();
	};

	NoteViewTextBox.prototype.__input = function(ev) {
		this.update();
	};

	NoteViewTextBox.prototype.__blurTextArea = function(ev) {
		if (this.__$textarea.val() === "") {
			this.remove();
		}

		this.update();
	};

	NoteViewTextBox.prototype.remove = function() {
		this.__$base.remove();
		this.fire("remove", this);
	};

	NoteViewTextBox.prototype.setFocus = function() {
		this.__$textarea.focus();
		this.update();
	};

	NoteViewTextBox.prototype.update = function() {
		this.__$base.toggleClass("-focus",
			this.__$textarea.val() !== "" &&
			document.activeElement === this.__$textarea[0]);
	};

	return NoteViewTextBox;
}());
;window.addEventListener("DOMContentLoaded", init);

function init() {
	toolbar = new ToolbarView();
	toolbar.setID("toolbar");
	toolbar.append($("#logo"));
	toolbar.insertBefore($("#maincontainer"));

	btnNewFile = new ButtonView("新規作成");
	btnNewFile.appendTo(toolbar);
	btnNewFile.bind("click", function() {
		p1Text.html(p1Text.html() + "新規作成<br />");
	});

	btnSave = new ButtonView("保存");
	btnSave.appendTo(toolbar);
	btnSave.bind("click", function() {
		p1Text.html(p1Text.html() + "保存<br />");
	});

	btnSave = new ButtonView("Import");
	btnSave.appendTo(toolbar);
	btnSave.bind("click", function() {
		p1Text.html(p1Text.html() + "Import<br />");
	});

	btnSave = new ButtonView("Export");
	btnSave.appendTo(toolbar);
	btnSave.bind("click", function() {
		p1Text.html(p1Text.html() + "Export<br />");
	});

	sideMenu = new SideMenuView();
	sideMenu.setID("sidemenu");
	sideMenu.append($("<p>new file.md</p>"));
	sideMenu.append($("<p>new file 2.md</p>"));
	sideMenu.appendTo($("#maincontainer"));

	toggleSideMenu = new ButtonView("メニューをたたむ");
	toggleSideMenu.appendTo(toolbar);
	toggleSideMenu.bind("click", function() {
		if (sideMenu.$base.css("marginLeft") === "-200px") {
			sideMenu.$base.animate(function(x) {
				this.css("marginLeft", -200 * (1 - x * x) + "px");
			}, 100);
		} else {
			sideMenu.$base.animate(function(x) {
				this.css("marginLeft", -200 * x * x + "px");
			}, 100);
		}
	}, this);

	noteView = new NoteView();
	noteView.setID("noteview");
	noteView.appendTo($("#maincontainer"));
}
;