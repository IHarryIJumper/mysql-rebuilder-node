'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.closeAllConnections = exports.closeTargetConnection = exports.closeInitialConnection = exports.targetQuery = exports.initialQuery = exports.targetConnect = exports.initialConnect = exports.start = undefined;

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import colors from 'colors/safe';
var hightlight = _chalk2.default.cyan;

var initialDatabase = {
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

var initialConnection = _mysql2.default.createConnection(initialDatabase);

var targetConnection = _mysql2.default.createConnection(targetDatabase);

var start = exports.start = function start() {
	var connections = [initialConnect(), targetConnect()];

	return _bluebird2.default.all(connections);
};

var initialConnect = exports.initialConnect = function initialConnect() {
	return new _bluebird2.default(function (resolve, reject) {
		initialConnection.connect(function (err) {
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

var targetConnect = exports.targetConnect = function targetConnect() {
	return new _bluebird2.default(function (resolve, reject) {
		targetConnection.connect(function (err) {
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

var initialQuery = exports.initialQuery = function initialQuery(query, variable) {
	return new _bluebird2.default(function (resolve, reject) {
		initialConnection.query(query, function (error, results, fields) {
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

var targetQuery = exports.targetQuery = function targetQuery(query, variable) {
	return new _bluebird2.default(function (resolve, reject) {
		targetConnection.query(query, function (error, results, fields) {
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

var closeInitialConnection = exports.closeInitialConnection = function closeInitialConnection() {
	return new _bluebird2.default(function (resolve, reject) {
		initialConnection.end(function (err) {
			if (err) {
				console.error('Close initial connaction error.', 'Error:', hightlight(err));
			};
			console.info('Initial connection closed');
			resolve(true);
		});
	});
};

var closeTargetConnection = exports.closeTargetConnection = function closeTargetConnection() {
	return new _bluebird2.default(function (resolve, reject) {
		targetConnection.end(function (err) {
			if (err) {
				console.error('Close target connaction error.', 'Error:', hightlight(err));
			};
			console.info('Target connection closed');
			resolve(true);
		});
	});
};

var closeAllConnections = exports.closeAllConnections = function closeAllConnections() {
	var connections = [closeInitialConnection(), closeTargetConnection()];

	return _bluebird2.default.all(connections);
};

var migrateConnection = {
	start: start,
	initialQuery: initialQuery,
	targetQuery: targetQuery,
	closeInitialConnection: closeInitialConnection,
	closeTargetConnection: closeTargetConnection,
	closeAllConnections: closeAllConnections
};

exports.default = migrateConnection;