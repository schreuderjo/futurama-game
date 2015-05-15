'use strict';

var _ = require('ramda');
var React = require('react');
var { FluxMixin, StoreWatchMixin } = require('flux');

var GameBoard = React.createClass({

    mixins: [FluxMixin, StoreWatchMixin('GameStore')],

    getInitialState: function () {
        return {};
    },

    getStateFromFlux: function () {
        return this.getFlux().stores.GameStore.getState();
    },

    render: function () {
        var cards = this.state.gameBoard.map(function (card, i) {
            console.log(card);
            return (
                <li><img src={card.url} /></li>
            );
        });
        return <div className="gameboard">
            <ul>
                {cards}
            </ul>
        </div>;
    }

});
module.exports = GameBoard;
