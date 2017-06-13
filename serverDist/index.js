"use strict";

require('./helpers/consoleLogHelper.js');

var _close = require('./helpers/close.js');

var _close2 = _interopRequireDefault(_close);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _databases = require('./mysql/databases.js');

var _databases2 = _interopRequireDefault(_databases);

var _migration = require('./migration/migration.js');

var _migration2 = _interopRequireDefault(_migration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var localPort = 5000;

console.start("MySQL rebuilder starting...");

var app = (0, _express2.default)();

app.listen(process.env.PORT || localPort);

console.start("Application initialized", "| Port:", '' + (process.env.PORT || localPort));

_databases2.default.start().then(function (resolve, reject) {
	if (Array.isArray(resolve) && reject === undefined) {
		var error = false;

		resolve.every(function (connection, connectionIndex) {
			if (connection !== true) {
				error = true;
			}

			return !error;
		});

		if (error) {
			console.error('Database connections resolve failed');
			(0, _close2.default)();
		} else {
			console.step("All connections were opened");
			_migration2.default.startMigration().then(function (resolve, reject) {
				if (reject) {
					console.error('Migration failed');
				}
				console.step('Migration completed!');
				_databases2.default.closeAllConnections().then(function (closeConnectionResolve, closeConnectionReject) {
					if (closeConnectionReject) {
						console.error('Close database connections failed');
					}
					(0, _close2.default)();
				});
			});
		}
	} else {
		console.error('Database connections failed');
		(0, _close2.default)();
	}

	/*migrateConnection.closeAllConnections().then((resolve, reject) => {
 	console.step("All connections were closed");
 });*/
});