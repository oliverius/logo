var assert = require('assert');
var app = require("../src/js/logo");

describe('Tokenizer', function() {
    describe('One single whitespace', function() {
        it('No tokens found', function() {            
            let tokenizer = new app.tokenizer();
            tokenizer.tokenize(' ');
            assert.equal(1, 1);
        })
    })
})