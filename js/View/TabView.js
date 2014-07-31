//#include("/View/View.js");

var TabView = (function() {

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
