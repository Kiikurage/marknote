//#include("/View/View.js");
//#include("/View/ButtonView.js");

var DialogView = (function() {

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
