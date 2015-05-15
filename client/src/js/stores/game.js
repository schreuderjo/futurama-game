'use strict';

var _ = require('ramda');
var Tuxxor = require('tuxxor');
var GameHelpers = require('helpers/utils');

//var UserConstants = require('constants').ActionTypes.user;

var GameStore = Tuxxor.createStore({

    initialize: function() {
        this.deck= [];
        this.gameBoard = [];
    },

    actions: {
        'loadEmployees': 'LOAD_EMPLOYEES'
    },

    loadEmployees: function (employees) {
        this.deck = employees;
        this.setBoard();
    },

    setBoard: function () {
        var shuffledDeck = GameHelpers.shuffle(this.deck);
        var selection = _.take(8, shuffledDeck);
        var doubled = GameHelpers.doubleArray(selection);
        this.gameBoard = GameHelpers.shuffle(doubled);
        this.emit('change');
    },

    getState: function() {
        return {
            gameBoard: this.gameBoard
        };
    }

});


module.exports = new GameStore();

