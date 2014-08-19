//#include("/View/DialogView.js");

var NewFileDialogView = (function() {

	function NewFileDialogView() {
		this.super();
		this.title("新規ファイルを作成");

		this.__$input = "";

		this.__$body.append($("<span>編集中のノートは失われてしまいます。よろしいですか？</span>"));
	}
	extendClass(NewFileDialogView, DialogView);

	return NewFileDialogView;
}());
