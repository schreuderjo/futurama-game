'use strict';

module.exports = {

    doubleArray: function (array) {
        return array.concat(array.slice());
    },

    shuffle: function(array) {
        var limit = array.length;

        for(var i=0, j, k, rand; i < limit; i++) {
            j = Math.floor(Math.random() * limit);
            k = array[i];
            array[i] = array[j];
            array[j] = k;
        }
        return array;
    },
};

