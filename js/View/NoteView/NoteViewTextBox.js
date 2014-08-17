//#include("/View/View.js");
//#include("/View/NoteView/NoteViewCursorView.js");
//#include("/Service/Markdown.js");
//#include("/Model/NoteViewTextboxModel.js");
//#include("/View/NoteView/NoteViewScopeParser.js");

var NoteViewTextbox = (function() {

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
		this.cursor.setSelection(0, 0);

		this.fire("update", this);
		this.__$base.addClass("-edit");
	};

	NoteViewTextbox.prototype.lostFocus = function() {
		this.cursor.detach(this);
		this.__$base.removeClass("-edit");

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
			var lineRenderingInfo = NoteViewScopeParser.convertLineToHTML(lines[i]),
				$line = $(lineRenderingInfo.html);

			this.renderingInfo.push({
				top: top,
				height: lineRenderingInfo.height,
				node: $line[0]
			});

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

		this.__$base.css({
			left: model.x,
			top: model.y,
			width: model.w,
			zIndex: model.z
		});
	};



	return NoteViewTextbox;
}());
