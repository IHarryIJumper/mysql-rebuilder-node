'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var error = _chalk2.default.red,
    warn = _chalk2.default.yellow,
    step = _chalk2.default.green,
    start = _chalk2.default.grey,
    info = _chalk2.default.blue; // import colors from 'colors/safe';


console.logPrototype = console.log;
console.errorPrototype = console.error;
console.warnPrototype = console.warn;

var dateTime = function dateTime() {
	var currentdate = new Date();
	var datetime = '[' + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + ']';

	return datetime;
};

console.log = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var date = [dateTime()];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.error = function () {
	for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		args[_key2] = arguments[_key2];
	}

	var date = [error(dateTime())];
	date = date.concat(args);
	if (console) {
		console.errorPrototype.apply(console, date);
	}
};

console.warn = function () {
	for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		args[_key3] = arguments[_key3];
	}

	var date = [warn(dateTime())];
	date = date.concat(args);
	if (console) {
		console.warnPrototype.apply(console, date);
	}
};

console.info = function () {
	for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
		args[_key4] = arguments[_key4];
	}

	var date = [info(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.start = function () {
	for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
		args[_key5] = arguments[_key5];
	}

	var date = [start(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.step = function () {
	for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
		args[_key6] = arguments[_key6];
	}

	var date = [step(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};