//#include("/View/View.js");

var ToolbarView = (function() {

    function ToolbarView() {
        this.super();

        this.$base = $("<div class='ToolbarView-base'></div>");
    }
    extendClass(ToolbarView, View);

    return ToolbarView;
}());
