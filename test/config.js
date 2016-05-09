require({
    'paths': {
        'qunit': '../bower_components/qunit/qunit/qunit'
    }
}, ['./tests'], function (tests) {
    'use strict';
    tests();
});