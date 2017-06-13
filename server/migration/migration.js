import Promise from 'bluebird';
import _ from 'lodash';
import progress from '../helpers/progress.js';

import {
	initialQuery,
	targetQuery
} from '../mysql/databases.js';

let settingsLength = 0,
	debugLength = 500,
	debug = false,
	migrationStep = 50,
	migrationStage = 0;

const startMigration = () => {
	return new Promise((resolve, reject) => {
		clearTargetDatabase().then((clearResolve, clearReject) => {
			if (clearReject) {
				throw 'Target database clear failed';
			}
			console.step('Target database cleared!');

			getInitialDatabaseLength().then((getResolve, getReject) => {
				if (getReject) {
					reject('failed');
					return;
				}

				settingsLength = parseInt(getResolve);
				if (debug && settingsLength > debugLength) {
					settingsLength = debugLength;
				}
				progress.initProgress(settingsLength * 3);

				console.log('Settings migration length:', settingsLength);

				migrationProgress().then((progressResolve, progressReject) => {
					resolve('finish');
				});
				// resolve(getResolve);
			});
		});
	});
};

const getInitialDatabaseLength = () => {
	return new Promise((resolve, reject) => {
		const getParam = 'COUNT(*)';
		initialQuery('SELECT ' + getParam + ' FROM end_points', getParam).then((queryResolve, queryReject) => {
			if (queryReject) {
				reject(false);
				return;
			}

			resolve(queryResolve);
		});
	});
};

const clearTargetDatabase = () => {
	return new Promise((resolve, reject) => {
		const getParam = 'COUNT(*)';
		targetQuery('DELETE FROM component').then((queryResolve, queryReject) => {
			if (queryReject) {
				throw 'target component table clear failed';
			}

			targetQuery('DELETE FROM instance').then((queryResolve, queryReject) => {
				if (queryReject) {
					throw 'target instance table clear failed';
				}

				targetQuery('DELETE FROM user').then((queryResolve, queryReject) => {
					if (queryReject) {
						throw 'target user table clear failed';
					}

					resolve(true);
				});
			});
		});
	});
};

const migrationIteration = () => {

	return new Promise((iterationResolve, iterationReject) => {
		// const getParam = '*';
		const getParam = 'end_points.id, end_points.widget_instance_id, end_points.comp_id, end_points.settings, widget_instances.id, widget_instances.instance_id, widget_instances.uid, widget_instances.created_at';
		initialQuery('SELECT ' + getParam + ' FROM end_points INNER JOIN widget_instances ON end_points.id=widget_instances.id LIMIT ' + ((settingsLength - migrationStage) < migrationStep ? (settingsLength - migrationStage) : migrationStep) + ' OFFSET ' + migrationStage).then((queryResolve, queryReject) => {
			if (queryReject) {
				throw 'query failed';
			}

			// console.log(queryResolve[0]);
			let upsert = [];

			_.each(queryResolve, (settingsItem, settingsItemIndex) => {

				// const settingsString = settingsItem.settings.replace(/'/g, "\\'");

				const settingsString = settingsItem.settings.replace(/'/g, "''");
				let compId = settingsItem.comp_id;
				if (!compId.includes('comp-')) {
					compId = 'comp-' + compId
				}
				// console.log(settingsString);

				const userInsert = "REPLACE INTO user (uid) VALUES ('" + settingsItem.uid + "')",
					instanceInsert = "REPLACE INTO instance (instance_id, vendor_product_id, uid, origin_instance_id, sign_date, permissions, ip_and_port, site_owner_id) VALUES ('" + settingsItem.instance_id + "', '" + null + "', '" + settingsItem.uid + "', '" + null + "', '" + (new Date(settingsItem.created_at)).toISOString().substring(0, 19).replace('T', ' ') + "', '" + null + "', '" + null + "', '" + settingsItem.uid + "')",
					settingsInsert = "REPLACE INTO component (instance_id, comp_id, settings) VALUES ('" + settingsItem.instance_id + "', '" + compId + "', '" + settingsString + "')";

				upsert.push(new Promise((resolve, reject) => {
					targetQuery(userInsert).then((setResolve, setReject) => {
						if (setReject) {
							throw 'user insert failed';
						}

						progress.progressTick();

						targetQuery(instanceInsert).then((setResolve, setReject) => {
							if (setReject) {
								throw 'instance insert failed';
							}

							progress.progressTick();

							targetQuery(settingsInsert).then((setResolve, setReject) => {
								if (setReject) {
									throw 'settings insert failed';
								}

								progress.progressTick();
								migrationStage++;
								// console.info("Save:", migrationStage, 'out of', settingsLength);
								resolve(true);
							});
						});
					});
				}));

			});

			Promise.all(upsert).then(() => {
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

const migrationProgress = () => {
	const iteration = (resolve) => {
		migrationIteration().then((iterationResolve, iterationReject) => {
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

	return new Promise((resolve, reject) => {
		iteration(resolve);
	});
};


const migration = {
	startMigration
};

export default migration;

// INSERT INTO component(instance_id, comp_id, settings) VALUES('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway')