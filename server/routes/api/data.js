'use strict';
/**
 * Developed by Engagement Lab, 2019
 * ==============
 * Route to retrieve all data
 * @class api
 * @author Johnny Richardson
 *
 * ==========
 */
const keystone = global.keystone;

var buildData = async (type, res) => {

    let homeFields = 'tagline screen1 talk track why.html what.html -_id';
    let aboutFields = 'intro para1 para2 what.html why.html guidePdf.url -_id';
    let aboutStudiesFields = 'caseStudiesIntro -_id';
    let aboutActivityFields = 'guidePdf.url -_id';
    let studiesFields = 'name description url -_id';
    let activityFields = 'name intro step1.html step2.html step3.html step4.html step5.html';
    let activityIntroFields = 'instructions.html -_id';

    let home = keystone.list('Home').model;
    let about = keystone.list('About').model;
    let study = keystone.list('CaseStudy').model;
    let activity = keystone.list('Activity').model;
    let activityIntro = keystone.list('ActivityIntro').model;

    let data = null;
    let getRes = [];

    if (type === 'home') {
        // Get home
        data = home.findOne({}, homeFields);
    }
    else if (type === 'about') {
        // Get about
        data = about.findOne({}, aboutFields);
    } 
    else if(type === 'activity') {
        
        // Get all activities
        data = activity.find({}, activityFields).sort({order: 1});
        let fileData = about.findOne({}, aboutActivityFields);

        getRes.push(await fileData.exec());

    }
    else if (type === 'activity-intro') {
        // Get activites intro (talk it out)
        data = activityIntro.findOne({}, activityIntroFields);
    } 
    else {
        
        // Get all studies
        let introData = about.findOne({}, aboutStudiesFields);
        data = study.find({}, studiesFields);

        getRes.push(await introData.exec());
        
    }

    try {
        getRes.push(await data.exec());
        res.json(getRes);
    } catch (e) {
        console.error(e)
        res.status(500).json({
            e
        });
    }

};

/*
 * Get data
 */
exports.get = function (req, res) {

    return buildData(req.params.type, res);

}