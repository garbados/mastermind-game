/* global describe, it, before */

var assert = require('assert')
var lib = require('../lib')
var pkg = require('../package.json')

describe([pkg.name, pkg.version].join(' v'), function () {
  describe('Game', function () {
    before(function () {
      this.game = new lib.Game()
    })

    it('should generate a secret with appropriate length and values', function () {
      assert(this.game._opts.secretLength === this.game.secret.length)
      this.game.secret.forEach((n) => {
        assert(n > 0)
        assert(n <= this.game._opts.numChoices)
      })
    })
  })
})
