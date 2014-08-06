//#include("/Interface/IPubSub.js");

var Model = (function() {
	function Model() {

	}
	IPubSub.implement(Model.prototype);

	Model.prototype.save = function(key) {
		localStorage.setItem(key, JSON.stringify(this.convertToNativeObject()));
	};

	Model.load = function(key) {
		return Model.convertFromNativeObject(JSON.parse(localStorage.getItem(key)));
	};

	Model.prototype.convertToNativeObject = function() {
		var scheme = this.constructor.scheme,
			res = {
				type: this.constructor.name,
				value: {}
			};

		if (!scheme) {
			return {};
		};


		for (var i = 0, max = scheme.length; i < max; i++) {
			var propName = scheme[i],
				val = this[propName];

			res.value[propName] = convertToNativeObject(val);
		}

		return res;
	}

	function convertToNativeObject(val) {
		var res;

		if (val instanceof Model) {

			res = val.convertToNativeObject();

		} else if (val instanceof Array) {

			arr = [];
			for (var j = 0, max2 = val.length; j < max2; j++) {
				arr.push(convertToNativeObject(val[j]));
			}
			res = {
				type: "array",
				value: arr
			};

		} else if (val instanceof Object) {

			obj = {};
			for (var j in val) {
				if (!val.hasOwnProperty(j)) continue;
				obj[j] = convertToNativeObject(val[j]);
			}
			res = {
				type: "object",
				value: obj
			};

		} else {

			res = {
				type: "native",
				value: val
			};

		}

		return res;
	}

	Model.convertFromNativeObject = function(data) {
		var res;

		switch (data.type) {
			case "native":
				res = data.value;
				break;

			case "array":
				res = [];
				for (var i = 0, max = data.value.length; i < max; i++) {
					res.push(Model.convertFromNativeObject(data.value[i]));
				}
				break;

			case "object":
				res = {};
				for (var key in data.value) {
					if (!data.value.hasOwnProperty(key)) continue
					res[key] = Model.convertFromNativeObject(data.value[key]);
				}
				break;

			default:
				res = new window[data.type]();
				for (var key in data.value) {
					if (!data.value.hasOwnProperty(key)) continue
					res[key] = Model.convertFromNativeObject(data.value[key]);
				}
				break;

		}

		return res;
	}

	Model.__record = function(name, getter, setter) {
		this.prototype.__defineGetter__(name, getter || function() {
			return this["_" + name];
		});
		this.prototype.__defineSetter__(name, function(value) {
			if (setter) {
				setter.call(this, value);
			} else {
				this["_" + name] = value
			}
			this.fire("update");
		});

		if (!this.scheme) this.scheme = [];
		this.scheme.push("_" + name);
	};

	return Model;
}());

var ModelTest = (function() {
	function ModelTest() {

	};
	extendClass(ModelTest, Model);

	ModelTest.__record("name");
	ModelTest.__record("age");
	ModelTest.__record("obj");
	ModelTest.__record("child");

	return ModelTest
}());
