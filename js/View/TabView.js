//#include("/View/View.js");

var TabView = (function(){

	function TabView() {
		this.super();

		this.$base = $("<div class='TabView-base'></div>");

		this.$headerContainer = $("<ul class='TabView-headerContainer'></div>");
		this.$headerContainer.appendTo(this.$base);

		this.$panelContainer = $("<div class='TabView-panelContainer'></div>");
		this.$panelContainer.appendTo(this.$base);

		this.panels = [];
		this.__activePanelIndex = null;

		this.addPanel("タブ");
		this.activatePanel(0);
	}
	extendClass(TabView, View);

	TabView.prototype.addPanel = function(name){
		var panel = new TabPanelView(name);

		panel.$header.appendTo(this.$headerContainer);
		panel.$base.appendTo(this.$panelContainer);

		panel.bind("click", this.clickPanel, this);
		this.panels.push(panel);

		return panel;
	};

	TabView.prototype.getPanel = function(index){
		return this.panels[index];
	};

	TabView.prototype.activatePanel = function(index) {
		if (this.__activePanelIndex !== null) {
			this.panels[this.__activePanelIndex].deactivate();
			this.__activePanelIndex = null;
		}

		this.panels[index].activate();
		this.__activePanelIndex = index;
	};

	TabView.prototype.clickPanel = function(ev, panel) {
		var i = 0
		for (i = 0, max = this.panels.length; i <max; i++)
			if (this.panels[i] === panel) break;

		if (i === this.panels.length) {
			return;
		}

		this.activatePanel(i);
	};

	return TabView;
}());

var TabPanelView = (function(){

	function TabPanelView(name) {
		this.super();

		this.$base = $("<div class='TabPanelView-base'></div>");

		this.$header = $("<div class='TabPanelView-header'></div>");

		this.$name = $("<span class='TabPanelView-name'>タブ</span>");
		this.$name.appendTo(this.$header);

		this.$header.bind("click", this.clickHeader, this, true);

		this.name = name;
	}
	extendClass(TabPanelView, View);

	TabPanelView.prototype.__defineSetter__("name", function(_name){
		this.$name.text(_name);
	});
	TabPanelView.prototype.__defineGetter__("name", function(){
		return this.$name.text();
	});

	TabPanelView.prototype.activate = function(){
		this.$base.addClass("-active");
		this.$header.addClass("-active");
	};

	TabPanelView.prototype.deactivate = function(){
		this.$base.removeClass("-active");
		this.$header.removeClass("-active");
	};

	TabPanelView.prototype.clickHeader = function(ev) {
		this.fire("click", ev, this);
	};

	return TabPanelView;
}());
