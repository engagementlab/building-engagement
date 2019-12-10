'use strict';
/**
 * Meetr API server
 * Developed by Engagement Lab, 2019
 * ==============
 * Script for sending out project survey reminder emails
 *
 * @author Johnny Richardson
 *
 * ==========
 */

require('dotenv').load();

const SendEmail = async function () {

    const Project = require('./models/Project'),
        mongoose = require('mongoose'),
        mailgun = require('mailgun-js')({
            apiKey: process.env.MAILGUN_KEY,
            domain: process.env.MAILGUN_DOMAIN
        }),
        winston = require('winston');
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.simple(),
            transports: [
                new(winston.transports.File)({filename: __dirname + '/emails.log', level: 'info'}),
                new(winston.transports.File)({filename: __dirname + '/emails.log', level: 'error'})
            ]
        });

    // Register user schema
    require('./models/AppUser');

    logger.info('----' + new Date() + '----');

    // Get all projects where reminder interval not null, and populate user for each
    let projects = Project.find({
        reminderPeriod: {
            $ne: null
        }
    }, 'name slug reminderPeriod reminderEmail lastReminderDate').populate('user');

    try {
        let getRes = await projects.exec();
        let recipientEmails = [];
        let recipientData = {};

        getRes.forEach((project, i) => {

            // Get time difference from last reminder date and today
            let dayDelta = new Date().getTime() - new Date(project.lastReminderDate).getTime();
            // Get delta in days by dividing by milliseconds in one day
            let daysSince = parseInt(dayDelta / (1000 * 3600 * 24));

            // Should email be sent?
            let send = false;

            switch (project.reminderPeriod) {
                case 0:
                    send = daysSince >= 14;
                    break;
                case 1:
                    send = daysSince >= 30;
                    break;
                case 2:
                    send = daysSince >= 60;
                    break;
            }

            // If period not triggered, skip
            if (!send)
                return;

            recipientEmails.push(project.reminderEmail);
            recipientData[project.reminderEmail] = {
                from: '<noreply@meetr.in>',
                to: project.reminderEmail,
                project: project.name,
                slug: project.slug,
                name: project.user.name
            };

            logger.info('=> Reminder for project "' + project.name + '" to ' + project.reminderEmail);

        });

        // If no recipients, quit
        if (recipientEmails.length === 0)
            return;

        const subject = (process.env.NODE_ENV !== 'production' ? '(TESTING) ' : '') + 'Meetr reminder for your project "%recipient.project%"',
              body = '<img src="https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,w_150/v1565109667/engagement-journalism/img/meetr_logo_raster.png" alt="Meetr logo" /><br /><br />' +
                    'Hi %recipient.name%,' +
                    '<p>How’s your engaged journalism project going? We want to keep helping you measure its value. Please remember to track the progress of your project, "%recipient.project%” on Meetr.<br /><br />' +
                    'Talk it out and track your progress by visiting <a href="https://meetr.in">Meetr</a>.</p>' +
                    'The Meetr Team';
        
        const data = {
            'recipient-variables': recipientData,
            from: 'Meetr <noreply@meetr.in>',
            to: recipientEmails,
            subject: subject,
            html: body
        };


        // Send message batch, and updated affected projects
        mailgun.messages().send(data, async function (error, body) {
            if (error) {
                logger.error('Mailgun error: ' + error)
                throw new Error('Mailgun error: ' + error)
            }

            logger.info('==> Sent ' + recipientEmails.length + ' reminder(s)');

            // If success, we need to update all affected projects w/ 
            // new last reminder date
            await Promise.all(getRes.map(async (project) => {
                project.lastReminderDate = new Date(Date.now()).toISOString();
                await project.save();
            }));

        });
    } catch (e) {
        throw Error(e);
    }
};

module.exports = SendEmail;