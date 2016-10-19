var dashboard = require('./dashboard.js');
var dashboard_data = require('./dashboard_data.js');
var organizations = require('./organizations.js');
var projects = require('./projects.js');

var routes = {
  dashboard: dashboard,
  dashboard_data: dashboard_data,
  organizations: organizations,
  projects: projects
}

module.exports = routes;
