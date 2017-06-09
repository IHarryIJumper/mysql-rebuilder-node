'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _progress = require('../helpers/progress.js');

var _progress2 = _interopRequireDefault(_progress);

var _databases = require('../mysql/databases.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settingsLength = 0,
    debugLength = 10000,
    debug = true,
    migrationStep = 10,
    migrationStage = 0;

var startMigration = function startMigration() {
	return new _bluebird2.default(function (resolve, reject) {
		getInitialDatabaseLength().then(function (getResolve, getReject) {
			if (getReject) {
				reject('failed');
				return;
			}

			settingsLength = parseInt(getResolve);
			if (debug) {
				settingsLength = debugLength;
			}
			_progress2.default.initProgress(settingsLength);

			console.log('Settings migration length:', settingsLength);

			migrationProgress();
			resolve('finish');
			// resolve(getResolve);
		});
	});
};

var getInitialDatabaseLength = function getInitialDatabaseLength() {
	return new _bluebird2.default(function (resolve, reject) {
		var getParam = 'COUNT(*)';
		(0, _databases.initialQuery)('SELECT ' + getParam + ' FROM end_points', getParam).then(function (queryResolve, queryReject) {
			if (queryReject) {
				reject(false);
				return;
			}

			resolve(queryResolve);
		});
	});
};

var migrationProgress = function migrationProgress() {
	var getParam = '*';
	(0, _databases.initialQuery)('SELECT ' + getParam + ' FROM end_points LIMIT ' + (debugLength - migrationStage < migrationStep ? debugLength - migrationStage : migrationStep) + ' OFFSET ' + migrationStage).then(function (queryResolve, queryReject) {
		if (queryReject) {
			// reject(false);
			throw 'query failed';
		}

		// console.log(queryResolve);
		var upsert = [];

		_lodash2.default.each(queryResolve, function (settingsItem, settingsItemIndex) {

			upsert.push(new _bluebird2.default(function (resolve, reject) {
				(0, _databases.targetQuery)("INSERT INTO component (instance_id, comp_id, settings) VALUES (" + null + ", " + settingsItem.comp_id + ", " + JSON.stringify(settingsItem.settings) + ")").then(function (setResolve, setReject) {
					if (setReject) {
						throw 'insert failed';
					}

					_progress2.default.progressTick();
					migrationStage++;

					resolve(true);
				});
			}));
		});

		new _bluebird2.default(upsert).then(function () {
			migrationProgress();
		});
	});
};

var migration = {
	startMigration: startMigration
};

exports.default = migration;

// INSERT INTO component(instance_id, comp_id, settings) VALUES('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway')