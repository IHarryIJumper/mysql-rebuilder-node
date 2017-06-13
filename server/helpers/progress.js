import ProgressBar from 'progress';

let bar = null;

/*const bar = new ProgressBar('  Migration [:bar] :rate/bps :percent :etas', {
	complete: '=',
	incomplete: ' ',
	width: 50,
	total: 1000
});
const timer = setInterval(function () {
	bar.tick();
	if (bar.complete) {
		console.step('complete\n');
		clearInterval(timer);
	}
}, 10);*/

export const initProgress = (maxValue) => {
	bar = new ProgressBar('  Migration [:bar] :rate/bps :percent :etas', {
		complete: '=',
		incomplete: ' ',
		width: 50,
		total: maxValue
	});
};

export const progressTick = () => {
	bar.tick();
	if (bar.complete) {
		console.info('Done.');
	}
};

const progress = {
	initProgress,
	progressTick
};

export default progress;