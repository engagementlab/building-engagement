'use strict';
/**
 * Meetr API server
 * Developed by Engagement Lab, 2019-2020
 * ==============
 * Script for sending out project survey reminder emails
 *
 * @author Johnny Richardson
 *
 * ==========
 */

require('dotenv').load();
const axios = require('axios');

const SendEmail = async function () {

    const emailBodyLogo = 
    `<img src="${process.env.EMAIL_LOGO}" alt="Meetr logo" /><br /><br />`;

    // Hook up mongo
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/engagement-journalism', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
    
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    const Project = require('./models/Project'),
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
    const projects = Project.find({
        reminderPeriod: {
            $ne: null
        }
    }, 'name slug reminderPeriod reminderEmail reminderEndDate lastReminderDate').populate('user');

    // Get email subject/body content from running API (which has CMS data)
    const emailContent = await axios.get(`http://localhost:${process.env.PORT}/api/data/get/email`);
    
    try {
        let recipientEmails = [];
        let recipientData = {};
        let getRes;
        let getContentRes = emailContent.data[0];
        
        try {
            
            getRes = await projects.exec();
            
            getRes.forEach((project) => {
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
                    case 3:
                        // 'Every day' (non-production/testing only)
                        send = daysSince >= 1;
                        break;
                }
               
                // If period not triggered, skip 
                if (!send)
                    return;

                // Create unique body text
                let bodyTxt =  emailBodyLogo + (project.subdomain === 'city' ? getContentRes.bodyCity.html : getContentRes.body.html);
                bodyTxt = bodyTxt.replace('[project]', project.name).replace('[name]', project.user.name);

                // Create unique subject
                const subjectPrefix = process.env.NODE_ENV !== 'production' ? '(TESTING) ' : '';
                let subjectTxt = project.subdomain === 'city' ? getContentRes.subjectCity : getContentRes.subject;
                subjectTxt = subjectTxt.replace('[project]', project.name).replace('[name]', project.user.name);
                subjectTxt = `${subjectPrefix}${subjectTxt}`;
                
                recipientEmails.push(project.reminderEmail);
                recipientData[project.reminderEmail] = {
                    from: '<noreply@meetr.in>',
                    to: project.reminderEmail,
                    subject: subjectTxt,
                    body: bodyTxt
                };

                logger.info('=> Reminder for project "' + project.name + '" to ' + project.reminderEmail);

            });

        }
        catch(e) {
            logger.error('Mongo error', e);
        }

        // If no recipients, quit
        if (recipientEmails.length === 0)
            process.exit(200);

        const data = {
            'recipient-variables': recipientData,
            from: 'Meetr <noreply@meetr.in>',
            to: recipientEmails,
            subject: '%recipient.subject%',
            html: '%recipient.body%'
        };

        // Send message batch, and updated affected projects
        mailgun.messages().send(data, async function (error, body) {
            try {
                if (error) 
                    logger.error('Mailgun error: ' + error)

                logger.info('==> Sent ' + recipientEmails.length + ' reminder(s)');

                // If success, we need to update all affected projects w/ 
                // new last reminder date
                try {

                    await Promise.all(getRes.map(async (project) => {
                        project.lastReminderDate = new Date(Date.now()).toISOString();

                        // Stop reminder if end date set, and it's today or in past
                        if(project.reminderEndDate) {
                            if(project.reminderEndDate <= new Date().getTime())
                                project.reminderPeriod = null;
                        }

                        await project.save();
                    })); 

                }
                catch (e) {
                    logger.error('Date update error:', e);
                }
    
            }
            catch (e) {
                logger.error(e);
            }

            process.exit(200);

        });
    } catch (e) {
        logger.error(e);
    }
};

module.exports = SendEmail();