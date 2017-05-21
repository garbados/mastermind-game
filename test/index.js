/* global describe, it, before */

var assert = require('assert')
var lib = require('../lib')
var pkg = require('../package.json')

describe([pkg.name, pkg.version].join(' v'), function () {
  describe('Game', function () {
    before(function () {
      this.game = new lib.Game()
    })

    it('should generate a secret with appropriate length and values.', function () {
      assert(this.game.secretLength === this.game.secret.length)
      this.game.secret.forEach((n) => {
        assert(n > 0)
        assert(n <= this.game._opts.numChoices)
      })
    })

    it('should evaluate guesses properly.', function () {
      this.game.secret = [2, 1, 2, 3]
      var guesses = [
        [1, 1, 1, 1],
        [2, 2, 1, 4],
        [2, 1, 2, 3]
      ]
      var responses = [
        { correctPosition: 1, correctNumber: 0 },
        { correctPosition: 1, correctNumber: 2 },
        { correctPosition: 4, correctNumber: 0 }
      ]
      guesses.forEach((guess, i) => {
        var response = this.game.evaluateGuess(guess)
        assert(response.correctPosition === responses[i].correctPosition)
        assert(response.correctNumber === responses[i].correctNumber)
      })
    })

    it('should attempt to run a game, but fail due to abstract `guess()`.', function () {
      try {
        this.game.play()
      } catch (err) {
        assert(err.message === 'Not implemented.')
      }
    })
  })

  describe('GameForMachines', function () {
    before(function () {
      this.game = new lib.GameForMachines()
    })

    it('should attempt to run a game, but fail due to abstract `guess()`.', function () {
      try {
        this.game.play()
      } catch (err) {
        assert(err.message === 'Not implemented.')
      }
    })
  })

  describe('Cheater', function () {
    before(function () {
      this.game = new lib.Cheater()
    })

    it('should win on the first try cuz it cheated.', function () {
      this.game.play()
      assert(this.game.history.length === 1)
    })
  })

  describe('Loser', function () {
    before(function () {
      this.game = new lib.Loser()
    })

    it('should lose the game.', function () {
      var didItWin = this.game.play()
      assert(didItWin === false)
    })
  })
})
