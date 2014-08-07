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
		return line
			.replace(/\t/g, "[tab]")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/ /g, "[space]");
	};

	NoteViewTextbox.prototype.getCursorRenderingInfo = function() {
		var text = this.model.text.slice(0, this.__receiver.selectionStart),
			lines = text.split("\n"),
			rows = lines.length,
			x, y, h;

		//y位置は対応する行要素のoffsetTop
		var line = this.__$textLayer.find(".NoteViewTextbox-line")[rows - 1];
		y = line.offsetTop;

		//x位置は必要文字数分のhtmlを実際にダミーDOMに流し込んで横幅を測定
		//hはダミーDOMの高さ
		var html = this.convertLineToHTML(lines[rows - 1]);
		this.__$dummyLine.html(html);

		var gcr = this.__$dummyLine[0].getBoundingClientRect();
		x = gcr.width;
		h = parseInt(getComputedStyle(line).lineHeight);

		return {
			x: x,
			y: y,
			h: h
		}
	};

	return NoteViewTextbox;
}());
