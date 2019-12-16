'use strict';
/**
 * Meetr API server
 * Developed by Engagement Lab, 2019
 * ==============
 * App start
 *
 * @author Johnny Richardson
 *
 * ==========
 */

// Load .env vars
if(process.env.NODE_ENV !== 'test')
	require('dotenv').load();

const winston = require('winston'),
bodyParser = require('body-parser'),
logFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp(),
	winston.format.align(),
	winston.format.printf((info) => {
		const {
		timestamp, level, message, ...args
		} = info;

		const ts = timestamp.slice(0, 19).replace('T', ' ');
		return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
	}),
),
Emails = require('./emails');

global.logger = winston.createLogger({
	level: 'info',
	format: logFormat,
	transports: [
		new winston.transports.Console()
	]
});

const bootstrap = require('@engagementlab/el-bootstrapper'), express = require('express');

var app = express();

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

bootstrap.start(
	'./config.json', 
	app,
	__dirname + '/', 
	{
		'name': 'Meetr CMS'
	},
	() => {
		
		app.listen(process.env.PORT);

		var mongoose = require('mongoose');
		mongoose.connect('mongodb://localhost/engagement-journalism', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
		
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));

		// Schedule email reminders (once per day at 6am on prod)
		let schedule = require('node-schedule');
		let period = NODE_ENV.environment === 'production' ? '0 6 * * *' : '* * * * *';
		schedule.scheduleJob(period, () => {

			Emails().catch(err => {
				// Print error if any
				console.error(err);
			});
			
		});

	}
);