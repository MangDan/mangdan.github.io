var hooks = require('hooks');

hooks.before('Hello World > Get a Hello World', function(transaction) {
    hooks.log('Executing hook "before" transaction "Hello World > Get a Hello World"');
});
hooks.after('Hello World > Get a Hello World', function(transaction) {
    hooks.log('Executing hook "after" transaction "Hello World > Get a Hello World"');
});
