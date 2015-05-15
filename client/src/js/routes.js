'use strict';

var { Route,Link, DefaultRoute } = require('react-router');

var App = require('handlers/app');

var routes = (
    <Route name="app" path="/" handler={App}>
    </Route>
);

module.exports = routes;
