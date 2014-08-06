var Syntax = [{
	symbol: "{S}",
	expression: ["{E}"]
}, {
	symbol: "{E}",
	expression: ["{Line}", "{E}"]
}, {
	symbol: "{E}",
	expression: ["{Line}", "\n", "{E}"]
}, {
	symbol: "{Line}",
	expression: "{0}"
}];

var Parser = (function() {

	var uid = 0;

	function Parser() {
		this.syntaxs = [];
		this.symbols = [];
		this.states = [];
		this.items = [];
	};

	Parser.prototype.syntaxParse = function(syntaxs) {
		this.syntaxs = syntaxs

		//1. シンボル登録、アイテム作成
		for (var i = 0, max = syntaxs.length; i < max; i++) {
			var syntax = syntaxs[i];

			this.registerSymbol(syntax.symbol);
			for (var j = 0, max2 = syntax.expression.length; j < max2; j++) {
				this.registerSymbol(syntax.expression[j]);
			}

			for (var j = 0, max2 = syntax.expression.length; j <= max2; j++) {
				var expressionArray = syntax.expression.slice(0);
				expressionArray.splice(j, 0, ".");

				var newItem = {
					symbol: syntax.symbol,
					expression: expressionArray
				};
				this.items.push(newItem);
			}
		}

		console.log("\nSymbols");
		console.log(this.symbols);

		for (var i = 0, max = this.items.length; i < max; i++) {
			var item = this.items[i];
			console.log(item.symbol + " -> " + item.expression.join(" "));
		}

		//2. 状態の一覧の作成
		this.parseState([], "{S}");

		console.log("\nStates")
		var i = 0;
		for (var hash in this.states) {
			if (!this.states.hasOwnProperty(hash)) return;
			console.log("状態" + i + " stack: " + this.states[hash].join(" "));
			i++;
		}
	};

	Parser.prototype.registerSymbol = function(symbol) {
		if (this.symbols.indexOf(symbol) === -1) {
			this.symbols.push(symbol)
		}
	};

	Parser.prototype.getSymbolID = function(symbol) {
		return ("000" + this.symbols.indexOf(symbol)).substr(-3);
	};

	Parser.prototype.convertToID = function(arr) {
		var res = "";
		for (var i = 0, max = arr.length; i < max; i++) {
			var symbol = arr[i];
			if (symbol === ".") {
				res += "-";
			} else {
				res += ("000" + this.symbols.indexOf(symbol)).substr(-3);
			}
		}
		return res;
	};

	Parser.prototype.parseState = function(stack, symbol) {
		var hash = this.convertToID(stack);
		if (this.states.hasOwnProperty(hash)) return;
		this.states[hash] = stack;

		console.log("\nstack:" + stack.join(" "));

		var nextStacks = {},
			items = this.items,
			parser = this;

		//1. 現在のスタックから予想されるアイテム候補の探索
		//	例)stack = ε 	>> 	item = E
		function check(stack, symbol) {
			for (var i = 0, max = items.length; i < max; i++) {
				var item = items[i];
				if ((symbol === undefined || item.symbol === symbol) &&
					itemMatch(item, stack)) {
					console.log(item.symbol + " -> " + item.expression.join(" "));

					var nextSymbol = getNextSymbol(item.expression),
						nextStack = stack.slice(0),
						hash;

					nextStack.push(nextSymbol);
					hash = parser.convertToID(nextStack)

					//右端を発見
					if (nextSymbol === undefined) continue;

					//既に登録済み
					if (nextStacks.hasOwnProperty(hash)) continue;

					nextStacks[hash] = nextStack;

					// 1-2. そのシンボルへ到達可能なルールの再適用
					check([], nextSymbol);
				}
			}
		};

		function itemMatch(item, stack) {
			var i = item.expression.indexOf(".");
			if (i === 0) return (stack === "");

			return parser.convertToID(item.expression.slice(0, i)) === parser.convertToID();
		};

		check(stack, symbol);

		if (nextStacks.length === 0) {
			console.log("    右端");
			return
		}

		//2. 再帰的探索
		for (var hash in nextStacks) {
			if (!nextStacks.hasOwnProperty(hash)) continue
			this.parseState(nextStacks[hash]);
		}
	};

	function getNextSymbol(expression) {
		var i = expression.indexOf(".");
		return expression.slice(i + 1)[0];
	}

	return Parser
}());

var p = new Parser();
p.syntaxParse(Syntax);
