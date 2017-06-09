"use strict";

import './helpers/consoleLogHelper.js';
import close from './helpers/close.js';

const localPort = 5000;

console.start("MySQL rebuilder starting...");

import express from 'express';

const app = express();

app.listen(process.env.PORT || localPort);

console.start("Application initialized", "| Port:", `${process.env.PORT || localPort}`);

import migrateConnection from './mysql/databases.js';
import migration from './migration/migration.js';

migrateConnection.start().then((resolve, reject) => {
	if (Array.isArray(resolve) && reject === undefined) {
		let error = false;

		resolve.every((connection, connectionIndex) => {
			if (connection !== true) {
				error = true;
			}

			return !error;
		});

		if (error) {
			console.error('Database connections resolve failed');
			close();
		} else {
			console.step("All connections were opened");
			migration.startMigration().then((reslve, reject) => {
				if (reject) {
					console.error('Migration failed');
				}
				/*console.step('Migration complete!');
				close();*/
			});
		}

	} else {
		console.error('Database connections failed');
		close();
	}

	/*migrateConnection.closeAllConnections().then((resolve, reject) => {
		console.step("All connections were closed");
	});*/
});