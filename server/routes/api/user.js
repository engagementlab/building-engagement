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
const AppUser = require('../../models/AppUser'),
      KeystoneUser = require('keystone').list('User').model;

let createUser = async (req, res) => {

    let newUser = new AppUser({ name: req.body.name, email: req.body.email, sub: req.body.sub, imgUrl: req.body.img});

    // Update last login date
    newUser.lastLogin = new Date(Date.now()).toISOString();

    try {
        let saveRes = await newUser.save();
        res.json(saveRes);
    }
    catch(e) {
        res.sendStatus(500);
    }
};

/*
 * Check if user for email exists and create one if not
 */
exports.exists = async (req, res) => {

    let userFind = AppUser.findOne({$or: [{email: req.body.email}, {sub: req.body.sub}]}, '_id imgUrl');

    try {
        let userRes = await userFind.exec();

        if(!userRes || (userRes && userRes.length < 1))
            createUser(req, res);
        else {

          // Update last login date
          userRes.lastLogin = new Date(Date.now()).toISOString();
          await userRes.save();

          res.status(200).send(userRes);
        }
    }
    catch(e) {
        console.error(e);
        res.status(500).send(e);
    }
}

/*
 * Find user on auth0 via email and return bool if/not found
 */
exports.find = async (req, res) => {

  // Get Auth0 management API token
  const request = require("request"),
  options = {
    method: 'POST',
    url: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/oauth/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'client_credentials',
      client_id: process.env.MEETR_AUTH0_CLIENT_ID,
      client_secret: process.env.MEETR_AUTH0_CLIENT_SECRET,
      audience: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/api/v2/'
    }
  };

  // Now check if input email is associated w/ any user
  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    let accessToken = JSON.parse(body)['access_token'];
    let options = {
    method: 'GET',
      url: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/api/v2/users-by-email',
      qs: {email: req.body.email},
      headers: {authorization: 'Bearer ' + accessToken}
    };

    request(options, function (error, response, body) {
      if (error) res.status(500).json({error});

      const users = JSON.parse(body),
            _l = require('lodash');

      // Find if any associated user signed up via social
      let isSocial = _l.some(users, (user) => {
          return user.user_id.indexOf('facebook') > -1 || user.user_id.indexOf('google') > -1
      });

      // User is found if response not '[]' (length > 0)
      res.json({social: isSocial, exists: users.length > 0});
    });
  });

};

/*
 *
 */
exports.admin = async (req, res) => {

    // Get Auth0 management API token
    const request = require("request"),
    options = {
      method: 'POST',
      url: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      form: {
        grant_type: 'client_credentials',
        client_id: process.env.MEETR_AUTH0_CLIENT_ID,
        client_secret: process.env.MEETR_AUTH0_CLIENT_SECRET,
        audience: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/api/v2/'
      }
    };

    // Now check if input user has 'Admin' role on Auth0
    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      let accessToken = JSON.parse(body)['access_token'];
      let options = {
      method: 'GET',
        url: 'https://' + process.env.MEETR_AUTH0_DOMAIN + '/api/v2/users/' + req.params.id + '/roles',
        headers: {authorization: 'Bearer ' + accessToken}
      };

      request(options, function (error, response, body) {
        if (error) res.status(500).json({error});

        const roles = JSON.parse(body);

        if (typeof roles[0] === 'undefined') {
          res.send(false)
          return
        }

        // Find if Admins role returned
        const isAdmin = roles[0].name === 'Admins';

        // User is found if response not '[]' (length > 1)
        res.send(isAdmin);
      });
    });

};
