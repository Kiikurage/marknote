//#include("/Interface/IPubSub.js");
//#include("/Service/bQuery.js");

var View = (function() {

	function View() {

	}
	IPubSub.implement(View.prototype);

	View.prototype.append = View.prototype.appendChild = function(child) {
		child.appendTo(this.__$base);
	};

	View.prototype.appendTo = function(parent) {
		parent.appendChild(this.__$base);
	};

	View.prototype.insertBefore = function(refElement) {
		this.__$base.insertBefore(refElement);
	};

	View.prototype.insertAfter = function(refElement) {
		this.__$base.insertAfter(refElement);
	};

	View.prototype.setID = function(id) {
		this.__$base.attr("id", id);
	};

	View.prototype.setPosition = function(left, top) {
		this.__$base.css({
			top: top,
			left: left
		});
	};

	View.prototype.setSize = function(width, height) {
		this.__$base.css({
			width: width,
			height: height
		});
	};

	return View;
}());
