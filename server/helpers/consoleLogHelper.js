console.logWithTime = (...args) => {
	const currentdate = new Date();
	const datetime = '[' + currentdate.getDate() + "/" +
		(currentdate.getMonth() + 1) + "/" +
		currentdate.getFullYear() + " @ " +
		currentdate.getHours() + ":" +
		currentdate.getMinutes() + ":" +
		currentdate.getSeconds() + ']';

	let text = [datetime];
	// console.log(text);
	text = text.concat(args);
	// console.log(text);
	// console.log(arguments.length);
	// console.log(datetime + ' ' + text)

	if (console) {
		console.log.apply(console, text);
	}
};