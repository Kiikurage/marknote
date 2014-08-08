//#include("/View/View.js");
//#include("/Service/Markdown.js");
//#include("/Model/NoteViewTextboxModel.js");

var NoteViewTextbox = (function() {

	function NoteViewTextbox(receiver) {
		this.super();

		this.__$base = $("<div class='NoteViewTextbox-base'></div>");
		this.__$base.bind("click", this.__click, this, true);
		this.__$base.bind("mousedown", this.__mousedown, this, true);

		this.__$resizeHandle = $("<div class='NoteViewTextbox-resizeHandle'></div>")
		this.__$resizeHandle.appendTo(this.__$base);
		this.__$resizeHandle.bind("mousedown", this.__mousedownResizeHandle, this, true);

		this.__$renderingLayer = $("<div class='NoteViewTextbox-renderingLayer'></div>")
		this.__$renderingLayer.appendTo(this.__$base);

		this.__$editLayer = $("<div class='NoteViewTextbox-editLayer' contenteditable='true'></div>")
		this.__$editLayer.appendTo(this.__$base);
		this.__$editLayer.bind("input", this.__input, this, true);
		this.__$editLayer.bind("keydown", this.__keydown, this, true);
		this.__$editLayer.bind("keyup", this.__keyup, this, true);
		this.__$editLayer.bind("blur", this.__blur, this, true);

		this.__isMultiByteInputMode = false;
	}
	extendClass(NoteViewTextbox, View);

	NoteViewTextbox.prototype.bindModel = function(model) {
		this.model = model;
		model.view = this;

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

	NoteViewTextbox.prototype.__input = function(ev) {
		var text = this.__$editLayer.text();
		this.model.text = text.slice(0, text.length - 1);
	};

	NoteViewTextbox.prototype.__keydown = function(ev) {
		if (ev.keyCode === KEYCODE.MULTIBYTE_MODE) {
			this.__isMultiByteInputMode = true;
		}
	};

	NoteViewTextbox.prototype.__keyup = function(ev) {
		if (ev.keyCode === KEYCODE.ENTER) {
			this.__isMultiByteInputMode = false;
			this.update();
		}
	};

	NoteViewTextbox.prototype.__blur = function(ev) {
		this.lostFocus();
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
		this.__$base.addClass("-edit");
		this.setCursorIndex(this.getCursorIndex());
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.__$base.removeClass("-edit");

		if (this.model.text.replace(/\s*/g, "") === "") this.remove();
	};

	/*-------------------------------------------------
	 * update
	 */
	NoteViewTextbox.prototype.update = function() {
		var model = this.model,
			text = model.text,
			html = this.convertTextToHTML(text);


		this.__$renderingLayer.html(html);
		this.__$base.css({
			left: model.x,
			top: model.y,
			width: model.w,
			zIndex: model.z
		});

		if (!this.__isMultiByteInputMode) {
			var index = this.getCursorIndex();
			this.__$editLayer.html(html);
			this.setCursorIndex(index);
		}

		this.fire("update", this);
	};

	NoteViewTextbox.prototype.convertTextToHTML = function(text) {
		var html = "",
			lines = text.split("\n");

		for (var i = 0, max = lines.length; i < max; i++) {
			html +=
				"<p class='NoteViewTextbox-line'>" +
				this.convertLineToHTML(lines[i]) +
				"</p>";
		}

		return html;
	};

	NoteViewTextbox.prototype.convertLineToHTML = function(line) {
		var parts = line.match(/^(\t*)(.*)$/, ""),
			indent = parts[1],
			body = parts[2],
			scopes = [],
			res = "";


		for (var i = 0, max = indent.length; i < max; i++) {
			res += wrapTextByScope("\t", ["NoteViewTextbox-scope-indent"]);
		}

		if (body[0] === "#") {
			var headerLevel = indent.length + 1;
			if (headerLevel > 6) headerLevel = 6;
			scopes.push("NoteViewTextbox-scope-header" + headerLevel);
		}
		if (body[0] === "-") scopes.push("NoteViewTextbox-scope-list");
		if (/^={3,}.*$/.test(body)) scopes.push("NoteViewTextbox-scope-hr");

		res += wrapTextByScope(body, scopes);

		return res;
	};

	function wrapTextByScope(text, scopes) {
		var pattern = "<span class='{class}'>{body}</span>",
			scopes = ["NoteViewTextbox-scope"].concat(scopes);

		var escaped = text
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/ /g, "&nbsp;");

		return pattern
			.replace("{class}", scopes.join(" "))
			.replace("{body}", escaped);
	};

	/*-------------------------------------------------
	 * cursor
	 */
	NoteViewTextbox.prototype.getCursorIndex = function() {
		var NODETYPE_TEXTNODE = 3,
			selection = document.getSelection(),
			baseNode = selection.baseNode,
			flagComplete = false;

		if (!baseNode) return 0;

		function getCursorIndexCore(rootNode) {
			var childNodes = rootNode.childNodes,
				index = 0;

			if (rootNode === baseNode) return 0;

			for (var i = 0, max = childNodes.length; i < max; i++) {
				var child = childNodes[i];

				if (child.nodeType !== NODETYPE_TEXTNODE) {

					if (child === baseNode) {
						flagComplete = true;
						return index;
					}

					index += getCursorIndexCore(child, index);
					if (flagComplete) {
						return index;
					}

				} else if (child === baseNode) {

					index += selection.getRangeAt(0).startOffset
					flagComplete = true;
					return index;

				} else {

					index += child.length;

				}

			}

			if (rootNode.classList.contains("NoteViewTextbox-line")) {
				index++;
			}

			return index;
		}

		return getCursorIndexCore(this.__$editLayer[0]);
	};

	NoteViewTextbox.prototype.setCursorIndex = function(index) {
		var NODETYPE_TEXTNODE = 3,
			flagComplete = false;

		function setCursorIndexCore(baseNode, index) {
			var childNodes = baseNode.childNodes;

			if (index === 0 && childNodes.length === 0) {
				var selection = document.getSelection(),
					range = document.createRange();

				if (baseNode.classList.contains("NoteViewTextbox-line")) {
					var $scope = $(wrapTextByScope("", []));
					$scope.appendTo(baseNode);
					baseNode = $scope[0];
				}

				range.setStart(baseNode, index);
				range.setEnd(baseNode, index);
				selection.removeAllRanges();
				selection.addRange(range);

				flagComplete = true;
				return 0;
			}

			for (var i = 0, max = childNodes.length; i < max; i++) {
				var child = childNodes[i];

				if (child.nodeType !== NODETYPE_TEXTNODE) {

					index = setCursorIndexCore(child, index);
					if (flagComplete) return 0;

				} else {

					var len = child.length;

					if (index > len) {
						index = index - len;
						continue;
					}

					var selection = document.getSelection(),
						range = document.createRange();

					range.setStart(child, index);
					range.setEnd(child, index);
					selection.removeAllRanges();
					selection.addRange(range);

					flagComplete = true;
					return 0;
				}
			}

			if (baseNode.classList.contains("NoteViewTextbox-line")) {
				index--;
			}

			return index;
		}

		setCursorIndexCore(this.__$editLayer[0], index);
	};

	return NoteViewTextbox;
}());
