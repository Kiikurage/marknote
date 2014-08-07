/*
test data

{"type":"NoteViewPageModel","value":{"_textboxes":{"type":"array","value":[{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":0},"_text":{"type":"native","value":"#Marknote\nマークダウンで手軽に綺麗にノートをとれるウェブアプリ\n===\nver. 0.1.1\n"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":160},"_text":{"type":"native","value":"\t#実装済みの機能\n\t-テキストエディット(カーソルが表示されない)\n\t\t-対応しているmarkdown記法\n\t\t\t-#ヘッダ\n\t\t\t--箇条書き\n\t-テキストボックスの再配置\n\t-セーブ/ロード\n"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":560},"_y":{"type":"native","value":320},"_text":{"type":"native","value":"\t#プロジェクトの情報\n-開発者 きくらげ(twitter: @mr_temperman)\n-\tgithub https://github.com/kikura-yuichiro/marknote"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":530},"_y":{"type":"native","value":330},"_text":{"type":"native","value":" "},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":560},"_y":{"type":"native","value":0},"_text":{"type":"native","value":"\t#使い方\n\t普通にノートが取れる。\n\t\n\t文頭に以下の記号を用いると特殊なスタイルに変換される\n\t-# ヘッダ\n\t\t-ヘッダは#1コしか認識しない\n\t\t-ヘッダのレベルはタブインデントにより制御する\n\t-- 箇条書き\n\t\t-こちらも同じくタブインデントでレベルを制御"},"_focus":{"type":"native","value":false}}},{"type":"NoteViewTextboxModel","value":{"_x":{"type":"native","value":20},"_y":{"type":"native","value":420},"_text":{"type":"native","value":"\t#今後つくろうと思っている機能\n\t-markdown記法の拡張\n\t\t-(画像)[url]による画像の挿入\n\t\t-表組み機能\t\n\t\t\t-表組みはmarkdownとしてではなく実装したい\n\t\n\t-Export機能\n\t\t-PDF/HTML/MD\n\t-ブック管理機能\n\t"},"_focus":{"type":"native","value":false}}}]}}}

*/

//#include("/View/ToolbarView.js");
//#include("/View/TabView.js");
//#include("/View/SideMenuView.js");
//#include("/View/ButtonView.js");
//#include("/View/NoteView.js");
//#include("/View/AlertView.js");
//#include("/View/NewFileDialogView.js");

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
