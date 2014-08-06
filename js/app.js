//#include("/View/ToolbarView.js");
//#include("/View/TabView.js");
//#include("/View/SideMenuView.js");
//#include("/View/ButtonView.js");
//#include("/View/NoteView.js");

window.addEventListener("DOMContentLoaded", init);

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
		if (sideMenu.__$base.css("marginLeft") === "-200px") {
			sideMenu.__$base.animate(function(x) {
				this.css("marginLeft", -200 * (1 - x * x) + "px");
			}, 100);
		} else {
			sideMenu.__$base.animate(function(x) {
				this.css("marginLeft", -200 * x * x + "px");
			}, 100);
		}
	}, this);

	noteView = new NoteView();
	noteView.setID("noteview");
	noteView.appendTo($("#maincontainer"));

	kr = new KeyRecognizer();
	kr.listen(document.body);
	kr.register({
		"cmd+S": function(ev) {
			console.log("セーブ");
			noteView.model.save("test");
			ev.preventDefault();
		},
		"cmd+O": function(ev) {
			console.log("開く");
			var savedata = Model.load("test");
			if (!savedata) {
				console.log("セーブデータが存在しない");
				return;
			}
			noteView.bindModel(savedata);
			ev.preventDefault();
		},
		"ctrl+cmd+N": function(ev) {
			console.log("新規作成");
			noteView.bindModel(new NoteViewPageModel());
			noteView.model.save("test");
			ev.preventDefault();
		},
	})

}
