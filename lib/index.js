const NUM_CHOICES = 6
const SECRET_LENGTH = 4
const NUM_GUESSES = 12
const ERR_NOT_IMPLEMENTED = 'Not implemented.'

class Game {
  static get NUM_CHOICES () {
    return NUM_CHOICES
  }

  static get SECRET_LENGTH () {
    return SECRET_LENGTH
  }

  static get NUM_GUESSES () {
    return NUM_GUESSES
  }

  get numChoices () { return this._opts.numChoices }
  get secretLength () { return this._opts.secretLength }
  get numGuesses () { return this._opts.numGuesses }

  constructor (opts) {
    opts = opts || {}
    this._opts = {}
    this._opts.numChoices = opts.numChoices || Game.NUM_CHOICES
    this._opts.secretLength = opts.secretLength || Game.SECRET_LENGTH
    this._opts.numGuesses = opts.numGuesses || Game.NUM_GUESSES
    this.secret = opts.secret || this.makeSecret(this._opts.numChoices, this._opts.secretLength)
  }

  makeSecret (numChoices, secretLength) {
    var secret = []
    for (var i = 0; i < secretLength; i++) {
      secret.push(Math.floor(Math.random() * numChoices) + 1)
    }
    return secret
  }

  evaluateGuess (guess) {
    /**
     * Test Cases (secret & guess -> response)
     * - [2 1 2 2] & [1 1 1 1] -> p 1 n 0
     */
    var tempSecret = this.secret.slice()
    var response = {
      correctPosition: 0,
      correctNumber: 0
    }

    guess
      .filter(function (n, i) {
        // look for exact matches
        if (tempSecret[i] === n) {
          // exact match found:
          // - increment correctPosition
          // - zero it in tempSecret (so it doesn't show up in searches)
          // - remove it from consideration re: correctNumber
          response.correctPosition++
          tempSecret[i] = 0
          return false
        } else {
          // preserve the value for consideration re: correctNumber
          return true
        }
      })
      .forEach(function (n) {
        // see if remaining numbers exist in the remains of tempSecret
        var j = tempSecret.indexOf(n)
        if (j > -1) {
          response.correctNumber++
          tempSecret[j] = 0
        }
      })

    return response
  }

  isGuessCorrect (guess) {
    return this.secret.reduce(function (a, b, i) {
      return a && (guess[i] === b)
    }, true)
  }

  play () {
    throw new Error(ERR_NOT_IMPLEMENTED)
  }
}

class GameForMachines extends Game {
  constructor (opts) {
    super(opts)
    this.history = []
  }

  guess (history) {
    throw new Error(ERR_NOT_IMPLEMENTED)
  }

  play () {
    while (this.history.length < this.numGuesses) {
      var guess = this.guess(this.history.slice())
      var response = this.evaluateGuess(guess)
      this.history.push({
        guess: guess,
        response: response
      })
      if (this.isGuessCorrect(guess)) {
        return true
      }
    }
    return false
  }
}

class Cheater extends GameForMachines {
  guess () {
    return this.secret
  }
}

class Loser extends GameForMachines {
  guess () {
    return this.secret.map((n) => {
      return this.numChoices - n + 1
    })
  }
}

exports.Game = Game
exports.GameForMachines = GameForMachines
exports.Cheater = Cheater
exports.Loser = Loser
