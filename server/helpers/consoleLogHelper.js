// import colors from 'colors/safe';
import colors from 'chalk';

const error = colors.red,
	warn = colors.yellow,
	step = colors.green,
	start = colors.grey,
	info = colors.blue;

console.logPrototype = console.log;
console.errorPrototype = console.error;
console.warnPrototype = console.warn;

const dateTime = () => {
	const currentdate = new Date();
	const datetime = '[' + currentdate.getDate() + "/" +
		(currentdate.getMonth() + 1) + "/" +
		currentdate.getFullYear() + " @ " +
		currentdate.getHours() + ":" +
		currentdate.getMinutes() + ":" +
		currentdate.getSeconds() + ']';

	return datetime;
};

console.log = (...args) => {
	let date = [dateTime()];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.error = (...args) => {
	let date = [error(dateTime())];
	date = date.concat(args);
	if (console) {
		console.errorPrototype.apply(console, date);
	}
};

console.warn = (...args) => {
	let date = [warn(dateTime())];
	date = date.concat(args);
	if (console) {
		console.warnPrototype.apply(console, date);
	}
};

console.info = (...args) => {
	let date = [info(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.start = (...args) => {
	let date = [start(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};

console.step = (...args) => {
	let date = [step(dateTime())];
	date = date.concat(args);
	if (console) {
		console.logPrototype.apply(console, date);
	}
};