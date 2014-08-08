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

		this.__$textLayer = $("<div class='NoteViewTextbox-textLayer'></div>")
		this.__$textLayer.appendTo(this.__$base);

		this.__$cursorLayer = $("<div class='NoteViewTextbox-cursorLayer'></div>")
		this.__$cursorLayer.appendTo(this.__$base);

		this.__$cursor = $("<div class='NoteViewTextbox-cursor'></div>");
		this.__$cursor.appendTo(this.__$cursorLayer);

		this.__$dummyLine = $("<div class='NoteViewTextbox-dummyLine'></div>");
		this.__$dummyLine.appendTo(this.__$cursorLayer);

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
		this.model.focus = true;

		var receiver = this.__receiver;
		receiver.bind("blur", this.lostFocus, this);
		receiver.bind("input", this.model.__receiverInput, this.model);
		receiver.setValue(this.model.text);
		receiver.renderingView = this;

		this.__$cursor.css("display", "");

		receiver.setFocus();
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.model.focus = false;

		var receiver = this.__receiver;
		receiver.unbind("blur", this.lostFocus, this);
		receiver.unbind("input", this.model.__receiverInput, this.model);
		receiver.renderingView = null;

		this.__$cursor.css("display", "none");
		this.blinkStop();

		if (this.model.text.replace(/\s*/g, "") === "") this.remove();
	};

	/*-------------------------------------------------
	 * update
	 */
	NoteViewTextbox.prototype.update = function() {
		var model = this.model,
			text = model.text,
			// html = Markdown.parse(text);
			html = this.convertTextToHTML(text);

		this.__$base.toggleClass("-edit", model.focus);
		this.__$textLayer.html(html);
		this.__$base.css({
			left: model.x,
			top: model.y,
			width: model.w,
			zIndex: model.z
		});

		var cursorRenderingInfo = this.getCursorRenderingInfo();
		this.__$cursor.css({
			left: cursorRenderingInfo.x,
			top: cursorRenderingInfo.y,
			height: cursorRenderingInfo.h
		});

		if (this.model.focus) this.blinkStart();

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
		var pattern = "<span class='{indentClass}'>{indent}</span><span class='{class}'>{body}</span>",
			indentClasses = ["NoteViewTextbox-scope", "NoteViewTextbox-scope-indent"],
			classes = ["NoteViewTextbox-scope"];

		var parts = line.match(/^(\t*)(.*)$/, ""),
			indent = parts[1],
			body = parts[2];

		var escapedIndent = indent
			.replace(/\t/g, "---&gt;");

		if (body[0] === "#") {
			var headerLevel = indent.length + 1;
			if (headerLevel > 6) headerLevel = 6;
			classes.push("NoteViewTextbox-scope-header" + headerLevel);
		}
		if (body[0] === "-") classes.push("NoteViewTextbox-scope-list");
		if (/^={3,}.*$/.test(body)) classes.push("NoteViewTextbox-scope-hr");

		var escapedBody = body
			.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
			.replace(/^\-/, "")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/ /g, "&nbsp;");

		return pattern
			.replace("{indentClass}", indentClasses.join(" "))
			.replace("{indent}", escapedIndent)
			.replace("{class}", classes.join(" "))
			.replace("{body}", escapedBody);
	};

	NoteViewTextbox.prototype.getCursorRenderingInfo = function() {
		var text = this.model.text.slice(0, this.__receiver.selectionStart),
			lines = text.split("\n"),
			rows = lines.length,
			x, y, h;

		//y位置は対応する行要素のoffsetTop
		var lineElement = this.__$textLayer.find(".NoteViewTextbox-line")[rows - 1];
		y = lineElement.offsetTop;

		//x位置は必要文字数分のhtmlを実際にダミーDOMに流し込んで横幅を測定
		//hはダミーDOMの高さ
		var line = lines[rows - 1],
			html = this.convertLineToHTML(line);

		this.__$dummyLine.html(html);

		var lineElementWidth = parseInt(getComputedStyle(lineElement).width),
			lineElementLineHeight = this.__$dummyLine.css("height"),
			gcr;

		gcr = this.__$dummyLine[0].getBoundingClientRect();

		//もし、ダミーDOMのwidthが実際のlineElementのwidthより長い場合、折り返しが発生している
		while (gcr.width > lineElementWidth) {
			var realLine = "";

			//1行下に下げる
			y += lineElementLineHeight;

			while (gcr.width > lineElementWidth) {
				//うまくいくまで末尾の1文字を削る
				realLine += line.substr(-1);
				line = line.slice(0, line.length - 1);
				html = this.convertLineToHTML(line);
				this.__$dummyLine.html(html);
				gcr = this.__$dummyLine[0].getBoundingClientRect();
			}

			line = realLine;
			html = this.convertLineToHTML(line);
			this.__$dummyLine.html(html);
			gcr = this.__$dummyLine[0].getBoundingClientRect();
		}

		x = gcr.width;

		//高さ
		var scopeElement
		if (lines[rows - 1] === "") {
			scopeElement = null;
		} else if ((/^\t*$/).test(lines[rows - 1])) {
			scopeElement = lineElement.children[1];
		} else {
			scopeElement = this.__$dummyLine[0].lastChild;
		}

		if (scopeElement) {
			y += scopeElement.offsetTop;
			h = parseInt(getComputedStyle(scopeElement).height) || "";
		} else {
			h = "";
		}

		return {
			x: x,
			y: y,
			h: h
		}
	};

	//指定された座標が論理行で何行目何文字目かを返す
	NoteViewTextbox.prototype.getRenderingPositionInfo = function(x, y) {
		var lines = this.model.text.split("\n"),
			lineElements = this.__$textLayer.children(),
			row = 0;

		for (var max = lineElements.length; row < max; row++) {
			if (lineElements[row].offsetTop > y) break
		}
		row--;

		//範囲外
		if (row < 0 || row >= lines.length) {
			return {
				row: row,
				column: -1
			};
		}

		var line = lines[row],
			html = this.convertLineToHTML(line),
			column = 0,
			lineElement = lineElements[row],
			lineElementWidth = parseInt(getComputedStyle(lineElement).width),
			lineElementLineHeight = this.__$dummyLine.css("height"),
			gcr;

		//仮想行の折り返しが生じていないかを確認
		this.__$dummyLine.html(html);
		gcr = this.__$dummyLine[0].getBoundingClientRect();
		while (true) {
			if (gcr.width > lineElementWidth) {

				//指定座標が、折り返しより後にあるのかを確認
				if (lineElement.offsetTop + lineElementLineHeight > y) break

				var realLine = "";

				while (gcr.width > lineElementWidth) {
					//うまくいくまで末尾の1文字を削る
					realLine += line.substr(-1);
					line = line.slice(0, line.length - 1);
					html = this.convertLineToHTML(line);
					this.__$dummyLine.html(html);
					gcr = this.__$dummyLine[0].getBoundingClientRect();
				}

				column += line.length;
				line = realLine;
				html = this.convertLineToHTML(line);
				this.__$dummyLine.html(html);
				gcr = this.__$dummyLine[0].getBoundingClientRect();

			} else {
				break;
			}
		}

		//dummtに1文字ずつ入れていき、指定位置を超えたらそこが指定された座標に対応する文字の位置
		var offset = 0;

		html = this.convertLineToHTML(line.slice(0, offset));
		this.__$dummyLine.html(html);
		gcr = this.__$dummyLine[0].getBoundingClientRect();

		while (gcr.width < x) {
			offset++;
			html = this.convertLineToHTML(line.slice(0, offset));
			this.__$dummyLine.html(html);
			gcr = this.__$dummyLine[0].getBoundingClientRect();

			if (offset >= line.length) break;
		}

		column += offset;

		return {
			row: row,
			column: column
		};
	};

	NoteViewTextbox.prototype.blinkStart = function() {
		if (this.__blinkTimerID) {
			clearInterval(this.__blinkTimerID);
		}

		this.__$cursor.addClass("-show");

		this.__blinkTimerID = setInterval(function() {
			this.blink();
		}.bind(this), 500);
	};

	NoteViewTextbox.prototype.blinkStop = function() {
		this.__$cursor.addClass("-show");

		clearInterval(this.__blinkTimerID);
		this.__blinkTimerID = null;
	};

	NoteViewTextbox.prototype.blink = function() {
		this.__$cursor.toggleClass("-show");
	};

	return NoteViewTextbox;
}());
