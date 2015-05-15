'use strict';

/**
 * Expose / conglomorate everything related to Flux here.
 * This also allows us to more cleanly use the FluxMixin without
 * needing to pass it React every time we use it.
 */

var React = require('react');
var { Flux, FluxMixin, StoreWatchMixin } = require('tuxxor');

var stores = {
    GameStore: require('stores/game')
};

var actions = {
    game: require('actions/game')
};

module.exports = {
    flux: new Flux(stores, actions),
    FluxMixin: FluxMixin(React),
    StoreWatchMixin: StoreWatchMixin
};

