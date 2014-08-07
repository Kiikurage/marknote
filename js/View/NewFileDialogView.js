//#include("/View/DialogView.js");

var NewFileDialogView = (function() {

	function NewFileDialogView() {
		this.super();
		this.title("新規ファイル名を入力");

		this.__$input = "";
	}
	extendClass(NewFileDialogView, DialogView);

	return NewFileDialogView;
}());
