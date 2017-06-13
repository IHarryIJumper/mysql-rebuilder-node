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
    debugLength = 500,
    debug = false,
    migrationStep = 50,
    migrationStage = 0;

var startMigration = function startMigration() {
	return new _bluebird2.default(function (resolve, reject) {
		clearTargetDatabase().then(function (clearResolve, clearReject) {
			if (clearReject) {
				throw 'Target database clear failed';
			}
			console.step('Target database cleared!');

			getInitialDatabaseLength().then(function (getResolve, getReject) {
				if (getReject) {
					reject('failed');
					return;
				}

				settingsLength = parseInt(getResolve);
				if (debug && settingsLength > debugLength) {
					settingsLength = debugLength;
				}
				_progress2.default.initProgress(settingsLength * 3);

				console.log('Settings migration length:', settingsLength);

				migrationProgress().then(function (progressResolve, progressReject) {
					resolve('finish');
				});
				// resolve(getResolve);
			});
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

var clearTargetDatabase = function clearTargetDatabase() {
	return new _bluebird2.default(function (resolve, reject) {
		var getParam = 'COUNT(*)';
		(0, _databases.targetQuery)('DELETE FROM component').then(function (queryResolve, queryReject) {
			if (queryReject) {
				throw 'target component table clear failed';
			}

			(0, _databases.targetQuery)('DELETE FROM instance').then(function (queryResolve, queryReject) {
				if (queryReject) {
					throw 'target instance table clear failed';
				}

				(0, _databases.targetQuery)('DELETE FROM user').then(function (queryResolve, queryReject) {
					if (queryReject) {
						throw 'target user table clear failed';
					}

					resolve(true);
				});
			});
		});
	});
};

var migrationIteration = function migrationIteration() {

	return new _bluebird2.default(function (iterationResolve, iterationReject) {
		// const getParam = '*';
		var getParam = 'end_points.id, end_points.widget_instance_id, end_points.comp_id, end_points.settings, widget_instances.id, widget_instances.instance_id, widget_instances.uid, widget_instances.created_at';
		(0, _databases.initialQuery)('SELECT ' + getParam + ' FROM end_points INNER JOIN widget_instances ON end_points.id=widget_instances.id LIMIT ' + (settingsLength - migrationStage < migrationStep ? settingsLength - migrationStage : migrationStep) + ' OFFSET ' + migrationStage).then(function (queryResolve, queryReject) {
			if (queryReject) {
				throw 'query failed';
			}

			// console.log(queryResolve[0]);
			var upsert = [];

			_lodash2.default.each(queryResolve, function (settingsItem, settingsItemIndex) {

				// const settingsString = settingsItem.settings.replace(/'/g, "\\'");

				var settingsString = settingsItem.settings.replace(/'/g, "''");
				var compId = settingsItem.comp_id;
				if (!compId.includes('comp-')) {
					compId = 'comp-' + compId;
				}
				// console.log(settingsString);

				var userInsert = "REPLACE INTO user (uid) VALUES ('" + settingsItem.uid + "')",
				    instanceInsert = "REPLACE INTO instance (instance_id, vendor_product_id, uid, origin_instance_id, sign_date, permissions, ip_and_port, site_owner_id) VALUES ('" + settingsItem.instance_id + "', '" + null + "', '" + settingsItem.uid + "', '" + null + "', '" + new Date(settingsItem.created_at).toISOString().substring(0, 19).replace('T', ' ') + "', '" + null + "', '" + null + "', '" + settingsItem.uid + "')",
				    settingsInsert = "REPLACE INTO component (instance_id, comp_id, settings) VALUES ('" + settingsItem.instance_id + "', '" + compId + "', '" + settingsString + "')";

				upsert.push(new _bluebird2.default(function (resolve, reject) {
					(0, _databases.targetQuery)(userInsert).then(function (setResolve, setReject) {
						if (setReject) {
							throw 'user insert failed';
						}

						_progress2.default.progressTick();

						(0, _databases.targetQuery)(instanceInsert).then(function (setResolve, setReject) {
							if (setReject) {
								throw 'instance insert failed';
							}

							_progress2.default.progressTick();

							(0, _databases.targetQuery)(settingsInsert).then(function (setResolve, setReject) {
								if (setReject) {
									throw 'settings insert failed';
								}

								_progress2.default.progressTick();
								migrationStage++;
								// console.info("Save:", migrationStage, 'out of', settingsLength);
								resolve(true);
							});
						});
					});
				}));
			});

			_bluebird2.default.all(upsert).then(function () {
				if (migrationStage < settingsLength) {
					// migrationIteration();
					iterationResolve('next');
				} else {
					iterationResolve('stop');
				}
			});
		});
	});
};

var migrationProgress = function migrationProgress() {
	var iteration = function iteration(resolve) {
		migrationIteration().then(function (iterationResolve, iterationReject) {
			if (iterationReject) {
				console.error("Migration error!", "migrationStage:", migrationStage, 'out of', settingsLength);
				throw 'Migration iteration failed';
			}

			if (iterationResolve === 'next') {
				iteration(resolve);
				// console.info("Iteration:", migrationStage, 'out of', settingsLength);
			} else if (iterationResolve === 'stop') {
				resolve('finished');
			}
		});
	};

	return new _bluebird2.default(function (resolve, reject) {
		iteration(resolve);
	});
};

var migration = {
	startMigration: startMigration
};

exports.default = migration;

// INSERT INTO component(instance_id, comp_id, settings) VALUES('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway')