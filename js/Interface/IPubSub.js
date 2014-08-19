//#include("/Service/util.js");
var IPubSub = (function(exports) {

	var callbackDict = {};
	var publisherList = {};
	var nativeCallbackDict = {};
	var guid = 0;

	window.callbackDict = callbackDict;
	window.publisherList = publisherList

	function getPublisherId(target, flagCreate) {
		var res = target._publisherID || (flagCreate ? target._publisherID = ++guid : undefined);
		if (res) publisherList[res] = target;

		return res;
	}

	exports.bind = function(publisher, type, fn, context, isNative) {
		//Prevent for register duplication
		exports.unbind(publisher, type, fn, context);

		var publisherID = getPublisherId(publisher, true);

		var callbackList = callbackDict[publisherID];
		if (!callbackList) {
			callbackList = callbackDict[publisherID] = {};
		}

		var callbacks = callbackList[type];
		if (!callbacks) {
			callbacks = callbackList[type] = [];
		}

		if (isNative) {
			var nativeCallbackList = nativeCallbackDict[publisherID];
			if (!nativeCallbackList) {
				nativeCallbackList = nativeCallbackDict[publisherID] = {};
			}

			var nativeCallback = nativeCallbackList[type];
			if (!nativeCallback) {
				nativeCallback = nativeCallbackList[type] = function(ev) {
					this.fire(type, ev);
				};

				publisher.addEventListener(type, nativeCallback);
			}
		}

		callbacks.push({
			context: context,
			fn: fn,
		});
	}

	exports.one = function(publisher, type, fn, context) {
		IPubSub.bind(publisher, type, function() {
			fn.apply(this, arguments);
			IPubSub.unbind(publisher, type, arguments.callee, context);
		}, context);
	};

	exports.unbind = function(publisher, type, fn, context) {
		var publisherID = getPublisherId(publisher);
		if (!publisherID) return;

		var callbackList = callbackDict[publisherID];
		if (!callbackList) return

		var callbacks = callbackList[type];
		if (!callbacks) return

		for (var i = 0, max = callbacks.length; i < max; i++) {
			var callback = callbacks[i];

			if (callback.fn === fn &&
				callback.context === context) {
				callbacks.splice(i, 1);
				i--;
				max--;
			}
		}

		if (callbacks.length > 0) return

		//remove nativeCallback
		var nativeCallbackList = nativeCallbackDict[publisherID];
		if (nativeCallbackList) {
			var nativeCallback = nativeCallbackList[type];
			if (nativeCallback) {
				publisher.removeEventListener(type, nativeCallback);
				nativeCallback = nativeCallbackList[type] = null;
			}
		}

		delete callbackList[type];
		if (!Object.keys(callbackList).length) {
			delete callbackDict[publisherID];
			delete publisherList[publisherID];

			if (nativeCallbackList) {
				delete nativeCallbackDict[publisherID];
			}
		};
	};

	exports.fire = function(publisher, type, argArr) {
		var publisherID = getPublisherId(publisher);
		if (!publisherID) return;

		var callbackList = callbackDict[publisherID];
		if (!callbackList) return

		var callbacks = callbackList[type];
		if (!callbacks) return

		argArr = argArr || [];

		var firedArr = [];

		var callback;
		while (callback = callbacks[0]) {
			callback.fn.apply(callback.context || publisher, argArr);
			if (callbacks[0] === callback) {
				firedArr.push(callbacks.shift());
			}
		}

		callbackList[type] = firedArr;
	};

	exports.attachShortHandle = function(target, types) {
		types.forEach(function(type) {
			target[type] = function(fn, context) {
				if (typeof fn === "function") {
					this.bind(type, fn, context || this);
				} else {
					this.fire(type);
				};
			}
		});
	};

	exports.removeEventListenerAll = function(publisher) {
		var publisherID = getPublisherId(publisher);
		if (!publisherID) return;

		var callbackList = callbackDict[publisherID];
		if (!callbackList) return

		var nativeCallbackList = nativeCallbackDict[publisherID];

		for (var type in callbackList) {
			if (!callbackList.hasOwnProperty(type)) continue;

			if (nativeCallbackList) {
				var nativeCallback = nativeCallbackList[type];
				if (nativeCallback) {
					publisher.removeEventListener(type, nativeCallback);
					nativeCallback = nativeCallbackList[type] = null;
				}
			}

			delete callbackList[type];
			if (!Object.keys(callbackList).length) {
				delete callbackDict[publisherID];
				delete publisherList[publisherID];

				if (nativeCallbackList) {
					delete nativeCallbackDict[publisherID];
				}
			};
		}
	};

	exports.implement = function(target) {
		target.bind = function(type, fn, context, isNative) {
			IPubSub.bind(this, type, fn, context, isNative);
			return this;
		};
		target.one = function(type, fn, context) {
			IPubSub.one(this, type, fn, context);
			return this;
		};
		target.unbind = function(type, fn, context) {
			IPubSub.unbind(this, type, fn, context);
			return this;
		};
		target.fire = function(type) {
			var args = [];
			args.push.apply(args, arguments);
			args.shift();
			IPubSub.fire(this, type, args);
			return this;
		};
		target.removeEventListenerAll = function() {
			IPubSub.removeEventListenerAll(target);
		}
	};

	return exports;
}({}));
