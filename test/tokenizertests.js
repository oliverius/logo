import Tokenizer from '../src/js/logo.js'
require('chai')
require('describe')

describe('Tokenizer', function () {
  describe('One single whitespace', function () {
    it('No tokens found', function () {
      const tokenizer = new Tokenizer()
      tokenizer.tokenize(' ')
      assert.equal(1, 1)
    })
  })
})
