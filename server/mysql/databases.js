import MySQL from 'mysql';

// import colors from 'colors/safe';
import colors from 'chalk';

import Promise from 'bluebird';

const hightlight = colors.cyan;

const initialDatabase = {
		host: 'localhost',
		user: 'andrey',
		password: 'root',
		database: 'impressive-slideshow-prod'
		// database: 'impressive-slideshow-test'
	},
	targetDatabase = {
		host: 'localhost',
		user: 'andrey',
		password: 'root',
		database: 'impressive-slideshow-new'
	};

const initialConnection = MySQL.createConnection(initialDatabase);

const targetConnection = MySQL.createConnection(targetDatabase);

export const start = () => {
	const connections = [initialConnect(), targetConnect()];

	return Promise.all(connections);
};

export const initialConnect = () => {
	return new Promise((resolve, reject) => {
		initialConnection.connect((err) => {
			if (err) {
				console.error('Initial connection error: ' + err.stack);
				console.errorPrototype('Database:', hightlight(initialDatabase.database), 'user:', hightlight(initialDatabase.user), 'host:', hightlight(initialDatabase.host));
				reject(false);
				return;
			}

			console.info('Initial connection to database', hightlight(initialDatabase.database), 'is established as ID', hightlight(initialConnection.threadId));
			resolve(true);
		});
	});
};

export const targetConnect = () => {
	return new Promise((resolve, reject) => {
		targetConnection.connect((err) => {
			if (err) {
				console.error('Target connection error: ' + err.stack);
				console.errorPrototype('Database:', hightlight(targetDatabase.database), 'user:', hightlight(targetDatabase.user), 'host:', hightlight(targetDatabase.host));
				reject(false);
				return;
			}

			console.info('Target connection to database', hightlight(targetDatabase.database), 'is established as ID', hightlight(targetConnection.threadId));
			resolve(true);
		});
	});
};

export const initialQuery = (query, variable) => {
	return new Promise((resolve, reject) => {
		initialConnection.query(query, (error, results, fields) => {
			if (error) {
				console.error('Initial query error.', 'Query:', hightlight(query));
				reject(false);
				throw error;
			};
			// console.step('Initial query result: ', results);

			if (variable !== undefined) {
				resolve(results[0][variable]);
			} else {
				resolve(results);
			}
		});
	});
};

export const targetQuery = (query, variable) => {
	return new Promise((resolve, reject) => {
		targetConnection.query(query, (error, results, fields) => {
			if (error) {
				console.error('Target query error.', 'Query:', hightlight(query));
				throw error;
			};
			// console.logPrototype(results[0].solution);
			// console.step('Target query result: ', results[0][variable]);
			// resolve(results[0][variable]);
			if (variable !== undefined) {
				resolve(results[0][variable]);
			} else {
				resolve(results);
			}
		});
	});
};

export const closeInitialConnection = () => {
	return new Promise((resolve, reject) => {
		initialConnection.end((err) => {
			if (err) {
				console.warn('Close initial connaction error.', 'Error:', hightlight(err));
			};
			console.info('Initial connection closed');
			resolve(true);
		});
	});

};

export const closeTargetConnection = () => {
	return new Promise((resolve, reject) => {
		targetConnection.end((err) => {
			if (err) {
				console.warn('Close target connaction error.', 'Error:', hightlight(err));
			};
			console.info('Target connection closed');
			resolve(true);
		});
	});
};

export const closeAllConnections = () => {
	const connections = [closeInitialConnection(), closeTargetConnection()];

	return Promise.all(connections);
};


const migrateConnection = {
	start,
	initialQuery,
	targetQuery,
	closeInitialConnection,
	closeTargetConnection,
	closeAllConnections
};

export default migrateConnection;