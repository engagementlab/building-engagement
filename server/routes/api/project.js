'use strict';
/**
 * Developed by Engagement Lab, 2019
 * ==============
 * Route to handle project creation/retrieval
 * @class api
 * @author Johnny Richardson
 *
 * ==========
 */
const Project = require('../../models/Project'),
      Progress = require('../../models/Progress'),
      PDF = global.keystone.list('PDF').model;

/*
 * Create data
 */
exports.create = async (req, res) => { 

    let displayName = req.body.name.replace(/ /g, '-').toLowerCase().replace(/[^\w\s]/gi, '-');
    let projectCt = await Project.count({name: req.body.name, user: req.body.userId}).exec();

    // Check if already exists
    if(projectCt > 0) {
        res.sendStatus(409);
        return;
    }

    let newProject = new Project({ 
        name: req.body.name, 
        description: req.body.description, 
        reminderEmail: req.body.reminderEmail,
        reminderPeriod: req.body.reminderPeriod,
        // Last reminder date is now, by default
        lastReminderDate: new Date(Date.now()).toISOString(),
        user: req.body.userId, 
        slug: displayName 
    });
 
    try {
        let saveRes = await newProject.save();
        res.json(saveRes);
    }
    catch(e) {
        res.status(500).json({e});
    }
}

/*
 * Delete project given id and user
 */
exports.delete = async (req, res) => {

    let deleteQ = Project.deleteOne({user: req.params.userId, slug: req.params.projectId});
    
    try {
        await deleteQ.exec();
        res.status(200).json({deleted: true});
    }
    catch(e) {
        res.status(500).json({e});
    }

}

/*
 * Get projects for user
 */
exports.getAll = async (req, res) => { 

    let userProjects = Project.find({user: req.params.userId}, 'name explanation slug -_id');
 
    try {
        let getRes = await userProjects.exec();
        res.json(getRes);
    }
    catch(e) {
        res.status(500).json({e});
    }
}

/*
 * Get project by user and project's slug/id
 */
exports.get = async (req, res) => { 

    let userProject = Project.findOne({user: req.params.userId, slug: req.params.projectId});
    
    try {
        let getProjectRes = await userProject.exec();
        let projProgress = Progress.find({project: getProjectRes._id}, 'sumX sumY note date -_id');
        let getProgressRes = await projProgress.exec();

        res.json({project: getProjectRes, progress: getProgressRes, projectId: getProjectRes._id});
    }
    catch(e) {
        console.error(e);
        res.sendStatus(404);
    }
}

/*
 * Get pre-filled CMS text to insert in project PDF and all this project's responses
 */
exports.pdf = async (req, res) => { 

    let pdf = PDF.findOne({}, 'intro explanation -_id');
    let projProgress = Progress.find({project: req.params.projectId}, 'responses -_id');
 
    try {
        let getResPdfTxt = await pdf.exec();
        let getProgressRes = await projProgress.exec();

        res.json({text: getResPdfTxt, responses: getProgressRes});
    }
    catch(e) {
        res.status(500).json({e});
    }
}
