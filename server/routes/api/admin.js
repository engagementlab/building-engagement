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
exports.all = async (req, res) => { 

    let usersFind = AppUser.find({}, 'name email lastLogin');
 
    try {
        let userRes = await usersFind.exec();
        await Promise.all(userRes.map(async (user) => {
        
            let userProjects = Project.find({user: user._id}, 'name description slug');
            let p = await userProjects.exec();

            return Object.assign({}, {user: user, projects: p});

        })).then(results =>  {
            // console.log
            res.status(200).send(results)
        });
    }
    catch(e) {
        console.error(e);
        res.status(500).send(e);
    }
}

/*
 * Find project by its mongo ID
 */
exports.project = async (req, res) => { 


    let getProject = Project.findOne({_id: req.params.projectId}, 'name description _id');
    
    try {
        let getProjectRes = await getProject.exec();
        let projProgress = Progress.find({project: getProjectRes._id}, 'sumX sumY note date -_id').sort({date: -1});
        let getProgressRes = await projProgress.exec();

        res.json({project: getProjectRes, progress: getProgressRes});
    }
    catch(e) {
        console.error(e);
        res.sendStatus(404);
    }

};