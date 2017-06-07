"use strict";

const localPort = 5000;

console.logWithTime("MySQL rebuilder starting...");

import './helpers/consoleLogHelper.js'

const express = require('express');
const app = express();

app.listen(process.env.PORT || localPort);

console.logWithTime("Application initialized", "| Port:", `${process.env.PORT || localPort}`);

// console.logWithTime(`Listening on http://localhost:${process.env.PORT || 8080}`);
// console.logWithTime(`Listening on http://localhost:${process.env.PORT || 8080}`);