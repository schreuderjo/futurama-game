'use strict';

var Promise = require('bluebird');
var reqwest = require('reqwest');
var _ = require('ramda');

module.exports = {

    loadEmployees: function() {
        return new Promise(function (resolve, reject) {
            reqwest({
                url: 'http://api.namegame.willowtreemobile.com',
                method: 'get',
                success: function (resp) {
                    resolve(resp);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
    }
};

