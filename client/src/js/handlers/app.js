'use strict';

var React = require('react');
var { RouteHandler } = require('react-router');
var { FluxMixin, StoreWatchMixin } = require('flux');
var GameBoard = require('components/gameboard');

var App = React.createClass({

    mixins: [FluxMixin],

    componentDidMount: function () {
       this.getFlux().actions.game.loadEmployees();
    },

    render: function() {
        return <div className="app-container">
            <h1>WAT Memory Game</h1>
            <GameBoard />
        </div>;
    }
});

module.exports = App;
