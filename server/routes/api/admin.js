'use strict';
/**
 * Developed by Engagement Lab, 2019
 * ==============
 * Route to handle admin functions
 * @class api
 * @author Johnny Richardson
 *
 * ==========
 */
const AppUser = require('../../models/AppUser'),
    Project = require('../../models/Project'),
    Progress = require('../../models/Progress');

/*
 * Get all users and their projects
 */
exports.users = async (req, res) => {

    let usersFind = AppUser.find({}, 'name email lastLogin');


    try {
        let userRes = await usersFind.exec();
        await Promise.all(userRes.map(async (user) => {

            // Get all user's projects
            const projects = await Project.find({
                user: user._id
            }, 'name description slug').exec();

            // Promise for all progress for all user's projects
            return await Promise.all(projects.map(async (project) => {

                // Get latest progress for this project
                const projProgress = await Progress.findOne({
                    project: project._id
                }, 'date -_id').sort({
                    'date': -1
                }).exec();
                return !projProgress ? null : projProgress.date;

            })).then((progress) => {

                // Get most recent progress (survey) date
                const latestSurveyDate = progress.sort((a, b) => {
                    return new Date(b) - new Date(a);
                })[0];

                // Create object for this user
                return Object.assign({}, {
                    user,
                    projects,
                    latestSurveyDate
                });

            });

        })).then(results => {
            res.status(200).send(results)
        });
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
}

/*
 * Find project by its mongo ID
 */
exports.project = async (req, res) => {


    let getProject = Project.findOne({
        _id: req.params.projectId
    }, 'name description user _id').populate('user');

    try {
        let getProjectRes = await getProject.exec();
        let projProgress = Progress.find({
            project: getProjectRes._id
        }, 'sumX sumY note date -_id');
        let getProgressRes = await projProgress.exec();

        res.json({
            project: getProjectRes,
            progress: getProgressRes
        });
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    }

};