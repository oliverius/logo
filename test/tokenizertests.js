import { Token, Tokenizer } from './../src/js/logo.js'
var assert = require('chai').assert
//var describe = require('mocha').describe

// import Tokenizer from '../src/js/logo.js'
// require('chai')
// require('describe')

describe('Tokenizer', function () {
  const tokenizer = new Tokenizer()
  describe('testo', function () {
    assert.equal(1, 1)
  })
})

// describe('Tokenizer', function () {
//   describe('One single whitespace', function () {
//     it('No tokens found', function () {
//       const tokenizer = new Tokenizer()
//       tokenizer.tokenize(' ')
//       assert.equal(1, 1)
//     })
//   })
// })
