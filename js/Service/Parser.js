var Syntax = [{
	symbol: "{ExpressionLv1}",
	expression: [{
		pattern: ["{ExpressionLv1}", "{OperatorLv1}", "{ExpressionLv2}"],
		output: "$1$2$3"
	}, {
		pattern: ["{ExpressionLv2}"],
		output: "$1"
	}]
}, {
	symbol: "{ExpressionLv2}",
	expression: [{
		pattern: ["{ExpressionLv2}", "{OperatorLv2}", "{Value}"],
		output: "$1$2$3"
	}, {
		pattern: ["{Value}"],
		output: "$1"
	}]
}, {
	symbol: "{Value}",
	expression: [{
		pattern: ["{Value}", "{Number}"],
		output: "$1$2"
	}, {
		pattern: ["{Number}"],
		output: "$1"
	}]
}, {
	symbol: "{Number}",
	expression: [{
		pattern: [/[0-9]/],
		output: "$1"
	}]
}, {
	symbol: "{OperatorLv1}",
	expression: [{
		pattern: [/[\+\-]/],
		output: "$1"
	}]
}, {
	symbol: "{OperatorLv2}",
	expression: [{
		pattern: [/[\*\/]/],
		output: "$1"
	}]
}];

// var Parser = (function() {

// 	var ACTIONTYPE = {
// 		REDUCE: 0,
// 		SHIFT: 1,
// 		ACCEPT: 2
// 	};

// 	function Parser() {
// 		this.syntaxs = [];
// 		this.symbols = [];
// 		this.notEndSymbols = [];
// 		this.states = {};
// 		this.items = [];
// 		this.parseTable = {};
// 	};

// 	Parser.prototype.syntaxParse = function(syntaxs) {
// 		this.syntaxs = syntaxs;
// 		this.syntaxs.push({
// 			symbol: "S",
// 			expression: ["E"],
// 			output: "End"
// 		});

// 		//1. シンボル登録、アイテム作成
// 		for (var i = 0, max = this.syntaxs.length; i < max; i++) {
// 			var syntax = this.syntaxs[i];

// 			this.registerSymbol(syntax.symbol);
// 			this.registerNotEndSymbol(syntax.symbol);

// 			for (var j = 0, max2 = syntax.expression.length; j < max2; j++) {
// 				this.registerSymbol(syntax.expression[j]);
// 			}

// 			for (var j = 0, max2 = syntax.expression.length; j <= max2; j++) {
// 				var expressionArray = syntax.expression.slice(0);
// 				expressionArray.splice(j, 0, ".");

// 				var newItem = {
// 					symbol: syntax.symbol,
// 					expression: expressionArray,
// 					output: syntax.output,
// 					id: this.items.length,
// 					syntaxID: i
// 				};
// 				this.items.push(newItem);
// 			}
// 		}

// 		console.log("--------------------------------------")
// 		console.log("Symbols");
// 		console.log(this.symbols);

// 		for (var i = 0, max = this.items.length; i < max; i++) {
// 			var item = this.items[i];
// 			console.log(item.symbol + " -> " + item.expression.join(" "));
// 		}

// 		//2. 状態の一覧の作成
// 		this.parseState([], "S");
// 		console.log(this.states);
// 		//3. 遷移状態一覧から構文解析表を作成
// 		this.generateParseTable();
// 	};

// 	Parser.prototype.registerSymbol = function(symbol) {
// 		if (this.symbols.indexOf(symbol) === -1) {
// 			this.symbols.push(symbol);
// 		}
// 	};

// 	Parser.prototype.registerNotEndSymbol = function(symbol) {
// 		if (this.notEndSymbols.indexOf(symbol) === -1) {
// 			this.notEndSymbols.push(symbol);
// 		}
// 	};

// 	Parser.prototype.parseState = function(stack, symbol) {
// 		var hash = this.convertStackToHash(stack),
// 			state = this.getStateByHash(hash) || this.addState(stack);

// 		console.log("--------------------------------------")
// 		console.log("状態:" + state.id);
// 		console.log("hash:" + state.hash);
// 		console.log("stack:" + state.stack.join(" "));

// 		var items = this.items,
// 			parser = this;

// 		//1. 現在のスタックから予想されるアイテム候補の探索
// 		var nextStackPattern = this.check(stack, symbol);
// 		if (nextStackPattern.length === 0) {
// 			//もう次の可能性がない
// 			return
// 		}

// 		//2. 再帰的探索
// 		for (var i = 0, max = nextStackPattern.length; i < max; i++) {
// 			this.parseState(nextStackPattern[i]);
// 		}
// 	};

// 	Parser.prototype.check = function(stack, symbol) {
// 		var that = this,
// 			items = this.items,
// 			nextStackPattern = [],
// 			nextStackHashPattern = [],
// 			currentState = that.getStateByStack(stack);

// 		function checkCore(stack, symbol, isRecursive) {

// 			for (var i = 0, max = items.length; i < max; i++) {
// 				var item = items[i];

// 				if ((symbol === undefined || item.symbol === symbol) &&
// 					that.itemMatch(item, stack)) {

// 					currentState.itemIDs.push(item.id);

// 					var nextSymbol = that.getNextSymbol(item.expression);

// 					if (nextSymbol === undefined) {
// 						//右端を発見
// 						console.log((isRecursive ? "+" + item.symbol : item.symbol + " ") + " -> " + item.expression.join(" ") + " 右端 " + item.output + "と出力");
// 						currentState.action[that.convertSymbolToID(nextSymbol)] = {
// 							type: ACTIONTYPE.REDUCE,
// 							value: item.syntaxID
// 						};
// 						continue;
// 					}

// 					var nextStack = stack.slice(0);
// 					nextStack.push(nextSymbol);

// 					var hash = that.convertStackToHash(nextStack),
// 						flagDuplication = that.hasStateByHash(hash),
// 						nextState = flagDuplication ? that.getStateByHash(hash) : that.addState(nextStack);

// 					//遷移先を保存
// 					currentState.action[that.convertSymbolToID(nextSymbol)] = {
// 						type: ACTIONTYPE.SHIFT,
// 						value: nextState.id
// 					};

// 					if (flagDuplication) {
// 						console.log((isRecursive ? "-" + item.symbol : item.symbol + " ") + " -> " + item.expression.join(" ") + " 状態" + nextState.id + "へ遷移");
// 						if (nextStackHashPattern.indexOf(hash) === -1) {
// 							nextStackHashPattern.push(hash);
// 							checkCore([], nextSymbol, true);
// 						}
// 						continue;
// 					}

// 					nextStackPattern.push(nextStack);
// 					nextStackHashPattern.push(hash);
// 					console.log((isRecursive ? "+" + item.symbol : item.symbol + " ") + " -> " + item.expression.join(" ") + " 状態" + nextState.id + "へ遷移");

// 					//そのシンボルへ到達可能なルールの再適用
// 					checkCore([], nextSymbol, true);
// 				}
// 			}
// 		}

// 		checkCore(stack, symbol, false);

// 		return nextStackPattern
// 	};

// 	Parser.prototype.generateParseTable = function() {
// 		var endItemID = this.items.length - 1;
// 		this.parseTable = {};

// 		for (var hash in this.states) {
// 			if (!this.states.hasOwnProperty(hash)) continue;

// 			var state = this.states[hash],
// 				action = state.action,
// 				actionList = {};
// 			this.parseTable[state.id] = actionList;

// 			//1. 非終端記号

// 			//2. 終端記号
// 			for (var symbolID in action) {
// 				if (!action.hasOwnProperty(symbolID)) continue;
// 				actionList[symbolID] = action[symbolID];
// 			}
// 			console.log(state.id, action);

// 			//3. 入力の終わり
// 			if (state.itemIDs.indexOf(endItemID) !== -1) {
// 				actionList[-1] = {
// 					type: ACTIONTYPE.ACCEPT
// 				};
// 			}

// 			//4. 出力を伴う文法をもったアイテム集合
// 			if (actionList[-1] && actionList[-1].type != ACTIONTYPE.ACCEPT) {
// 				for (var i = 0, max = this.symbols.length; i < max; i++) {
// 					var symbol = this.symbols[i],
// 						symbolID = this.convertSymbolToID(symbol);
// 					if (this.notEndSymbols.indexOf(symbol) !== -1) continue;

// 					//すでにアクションが定義済みなら無視
// 					if (actionList[symbolID]) continue;

// 					actionList[symbolID] = actionList[-1];
// 				}
// 			}
// 		}
// 	};

// 	Parser.prototype.itemMatch = function(item, stack) {
// 		var i = item.expression.indexOf(".");
// 		return this.convertStackToHash(item.expression.slice(0, i)) === this.convertStackToHash(stack);
// 	};

// 	Parser.prototype.getNextSymbol = function(expression) {
// 		var i = expression.indexOf(".");
// 		return expression.slice(i + 1)[0];
// 	};

// 	//スタック状態を遷移状態に追加する
// 	Parser.prototype.addState = function(stack) {
// 		var hash = this.convertStackToHash(stack);

// 		if (!this.hasStateByStack(stack)) {
// 			var state = {
// 				id: Object.keys(this.states).length,
// 				stack: stack.slice(0),
// 				hash: hash,
// 				action: {},
// 				itemIDs: []
// 			};

// 			this.states[hash] = state;
// 		}

// 		return this.states[hash];
// 	};

// 	//ある遷移状態が、既に保存されているかスタック状態で調べる
// 	Parser.prototype.hasStateByStack = function(stack) {
// 		return this.hasStateByHash(this.convertStackToHash(stack));
// 	};
// 	//ある遷移状態が、既に保存されているかハッシュ値で調べる
// 	Parser.prototype.hasStateByHash = function(hash) {
// 		return this.states.hasOwnProperty(hash);
// 	};

// 	//遷移状態情報をハッシュ値から取得する
// 	Parser.prototype.getStateByHash = function(hash) {
// 		return this.states[hash];
// 	};
// 	//遷移状態情報をスタック状態から取得する
// 	Parser.prototype.getStateByStack = function(stack) {
// 		return this.getStateByHash(this.convertStackToHash(stack));
// 	};

// 	//スタック状態をハッシュ値に変換する
// 	Parser.prototype.convertStackToHash = function(stack) {
// 		if (stack.length === 0) return 0;

// 		//スタック状態はアイテムと同数しか存在しない
// 		var res = "";
// 		for (var i = 0, max = stack.length; i < max; i++)
// 			res += this.convertSymbolToID(stack[i]);

// 		return res;
// 	};

// 	//シンボルをシンボルIDに変換する
// 	Parser.prototype.convertSymbolToID = function(symbol) {
// 		if (symbol === ".") return "-"
// 		return ("0" + this.symbols.indexOf(symbol)).substr(-2);
// 	};

// 	//パース
// 	Parser.prototype.parse = function(text) {
// 		var stateStack = [],
// 			symbolStack = [],
// 			outputStack = [],
// 			cursor = 0,
// 			max = text.length,
// 			state = 0;

// 		while (cursor <= max) {
// 			console.log("======================================")
// 			console.log("State   : " + state);
// 			console.log("SymStack: " + symbolStack.join(" "));
// 			console.log("StaStack: " + stateStack.join(" "));
// 			console.log(outputStack);

// 			var symbol = text[cursor],
// 				symbolID = this.convertSymbolToID(symbol) || -1;
// 			console.log("--------------------------------------")
// 			console.log("Symbol  : " + symbol + " ID: " + symbolID);

// 			var action = this.parseTable[state][symbolID];

// 			switch (action.type) {
// 				case ACTIONTYPE.REDUCE:
// 					console.log("Reduce  : " + action.value);

// 					var syntax = this.syntaxs[action.value];
// 					stateStack.push(state);

// 					popedValue = [];
// 					for (var i = 0, max2 = syntax.expression.length; i < max2; i++) {
// 						symbolStack.pop()
// 						popedValue.unshift(outputStack.pop());
// 						state = stateStack.pop();
// 					}
// 					outputValue = syntax.output;
// 					for (var i = 0, max2 = popedValue.length; i < max2; i++) {
// 						outputValue = outputValue.replace("$" + (i + 1), popedValue[i]);
// 					}
// 					symbolStack.push(syntax.symbol);
// 					outputStack.push(outputValue);

// 					state = stateStack.pop();
// 					symbol = syntax.symbol;
// 					symbolID = this.convertSymbolToID(symbol) || -1;

// 					console.log("======================================")
// 					console.log("State   : " + state);
// 					console.log("SymStack: " + symbolStack.join(" "));
// 					console.log("StaStack: " + stateStack.join(" "));
// 					console.log("--------------------------------------")
// 					console.log("Symbol  : " + symbol + " ID: " + symbolID);


// 					var action2 = this.parseTable[state][symbolID];
// 					stateStack.push(state);
// 					state = action2.value;
// 					break;

// 				case ACTIONTYPE.SHIFT:
// 					cursor++;
// 					stateStack.push(state);
// 					state = action.value;
// 					symbolStack.push(symbol);
// 					outputStack.push(symbol);
// 					console.log("Shift   : " + state);

// 					break;

// 				case ACTIONTYPE.ACCEPT:
// 					console.log("Accept  :");
// 					console.log(outputStack);
// 					return outputStack
// 					break;

// 				default:
// 					console.log("!?");
// 			}
// 		}

// 	};

// 	return Parser
// }());

// var p = new Parser();
// p.syntaxParse(Syntax);
// console.log(p);

// p.parse("125+24*3+4*5");
