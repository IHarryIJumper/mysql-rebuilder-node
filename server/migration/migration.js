import Promise from 'bluebird';
import _ from 'lodash';
import progress from '../helpers/progress.js';

import {
	initialQuery,
	targetQuery
} from '../mysql/databases.js';

let settingsLength = 0,
	debugLength = 10000,
	debug = true,
	migrationStep = 10,
	migrationStage = 0;

const startMigration = () => {
	return new Promise((resolve, reject) => {
		getInitialDatabaseLength().then((getResolve, getReject) => {
			if (getReject) {
				reject('failed');
				return;
			}

			settingsLength = parseInt(getResolve);
			if (debug) {
				settingsLength = debugLength;
			}
			progress.initProgress(settingsLength);

			console.log('Settings migration length:', settingsLength);

			migrationProgress();
			resolve('finish');
			// resolve(getResolve);
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

const migrationProgress = () => {
	const getParam = '*';
	initialQuery('SELECT ' + getParam + ' FROM end_points LIMIT ' + ((debugLength - migrationStage) < migrationStep ? (debugLength - migrationStage) : migrationStep) + ' OFFSET ' + migrationStage).then((queryResolve, queryReject) => {
		if (queryReject) {
			// reject(false);
			throw 'query failed';
		}

		// console.log(queryResolve);
		let upsert = [];

		_.each(queryResolve, (settingsItem, settingsItemIndex) => {

			upsert.push(new Promise((resolve, reject) => {
				targetQuery("INSERT INTO component (instance_id, comp_id, settings) VALUES (" + null + ", " + settingsItem.comp_id + ", " + JSON.stringify(settingsItem.settings) + ")").then((setResolve, setReject) => {
					if (setReject) {
						throw 'insert failed';
					}

					progress.progressTick();
					migrationStage++;

					resolve(true);
				});
			}));



		});

		new Promise(upsert).then(() => {
			migrationProgress();
		});

	});
};


const migration = {
	startMigration
};

export default migration;

// INSERT INTO component(instance_id, comp_id, settings) VALUES('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway')