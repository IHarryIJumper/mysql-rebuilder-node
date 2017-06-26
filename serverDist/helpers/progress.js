'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.progressTick = exports.initProgress = undefined;

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bar = null;

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

var initProgress = exports.initProgress = function initProgress(maxValue) {
	bar = new _progress2.default('  Migration [:bar] :rate/ops :percent :etas', {
		complete: '=',
		incomplete: ' ',
		width: 50,
		total: maxValue
	});
};

var progressTick = exports.progressTick = function progressTick() {
	bar.tick();
	if (bar.complete) {
		console.info('Done.');
	}
};

var progress = {
	initProgress: initProgress,
	progressTick: progressTick
};

exports.default = progress;