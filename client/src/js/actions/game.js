'use strict';

var EmployeeAPI = require('apis/employees');

var GameActions = {
    loadEmployees: function () {
        return EmployeeAPI.loadEmployees()
        .then(function (response) {
            this.dispatch("LOAD_EMPLOYEES", response);
        }.bind(this));
    }
};

module.exports = GameActions;
