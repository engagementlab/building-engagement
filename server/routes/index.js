const keystone = global.keystone;
const express = require('express');
var router = express.Router();
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('render', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
    api: importRoutes('./api')
};
let routeIncludes = [keystone.middleware.api, keystone.middleware.cors];
let origin = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN : "http://localhost:4200";

// Setup Route Bindings 
// CORS
router.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD, PUT');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method");
    
    if(req.method === 'OPTIONS')
        res.sendStatus(200);
    else
        next();

});

router.get('/api/data/get/:type', routeIncludes, routes.api.data.get);

router.post('/api/user/create', routeIncludes, routes.api.user.create);
router.post('/api/user/exists', routeIncludes, routes.api.user.exists);
router.post('/api/user/find', routeIncludes, routes.api.user.find);

router.post('/api/project/create', routeIncludes, routes.api.project.create);
router.get('/api/project/get/:userId', routeIncludes, routes.api.project.getAll);
router.get('/api/project/get/:userId/:projectId', routeIncludes, routes.api.project.get);
router.get('/api/project/delete/:userId/:projectId', routeIncludes, routes.api.project.delete);

router.post('/api/progress/create', routeIncludes, routes.api.progress.create);

router.get('/api/admin/get/all', routeIncludes, routes.api.admin.all);
router.get('/api/admin/get/project/:projectId', routeIncludes, routes.api.admin.project);


module.exports = router;