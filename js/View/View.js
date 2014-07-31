//#include("/Interface/IPubSub.js");
//#include("/Service/bQuery.js");

var View = (function() {

	function View() {

	}
	IPubSub.implement(View.prototype);

	View.prototype.append = View.prototype.appendChild = function(child) {
		child.appendTo(this.$base);
	};

	View.prototype.appendTo = function(parent) {
		parent.appendChild(this.$base);
	};

	View.prototype.insertBefore = function(refElement) {
		this.$base.insertBefore(refElement);
	};

	View.prototype.insertAfter = function(refElement) {
		this.$base.insertAfter(refElement);
	};

	View.prototype.setID = function(id) {
		this.$base.attr("id", id);
	};

	return View;
}());
