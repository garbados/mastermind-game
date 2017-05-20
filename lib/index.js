// var _ = require('underscore')
var prompt = require('prompt')
var Table = require('cli-table2')
var async = require('async')

const NUM_CHOICES = 6
const SECRET_LENGTH = 4
const NUM_GUESSES = 12

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
}

class GameForHumans extends Game {
  preparePrompt () {
    prompt.message = ''
    prompt.delimiter = ''
    prompt.colors = false
    prompt.start()
    this._promptReady = true
  }

  promptGuess (done) {
    if (!this._promptReady) this.preparePrompt()
    prompt
      .get({
        properties: {
          guess: {
            description: 'Please enter your guess:',
            message: 'Guesses must be space-delimited sequences with exactly ' + String(this.secretLength) + ' integers between 1 and ' + String(this.numChoices) + '.',
            required: true,
            type: 'string',
            pattern: '^' + this.secret.map(() => { return '[1-' + String(this.numChoices) + ']' }).join(' ') + '$',
            before: function (rawGuess) {
              return rawGuess.split(' ').map(function (n) {
                return parseInt(n)
              })
            }
          }
        }
      }, function (err, result) {
        if (err) {
          done(err)
        } else {
          done(null, result.guess)
        }
      })
  }

  respondToGuess (guess) {
    var response = this.evaluateGuess(guess)
    var table = new Table({
      head: ['Guess', 'Correct Position', 'Correct Number']
    })
    table.push([guess.join(' '), response.correctPosition, response.correctNumber])
    console.log(table.toString())
  }

  play (done) {
    var history = []
    // get each turn's guess
    console.log('Let\'s play a game...')
    console.log('I\'m thinking of ' + this.secretLength + ' numbers between 1 and ' + this.numChoices + '.')
    console.log('Can you guess the sequence?')
    // TODO all this fucking printing makes me bonkers
    async.doUntil(this.promptGuess.bind(this), (guess) => {
      history.push(guess)
      if (this.isGuessCorrect(guess)) {
        // print: correct! you win!
        console.log('That is correct! You win')
        return true
      } else if (history.length >= this.numGuesses) {
        // print: you lose! too many guesses!
        console.log('You lose! Too many guesses!')
        console.log('The secret was ' + this.secret.join(' '))
        return true
      } else {
        // print what they got right, wrong, etc
        this.respondToGuess(guess)
        return false
      }
    }, function (err, results) {
      if (err) {
        console.log(err)
      } else if (done) {
        done(null, results)
      }
    })
  }
}

class GameForMachines extends Game {
  constructor (opts) {
    super(opts)
    this.history = []
  }

  guess (history) {
    throw new Error('Not implemented.')
  }

  play () {
    var isGuessCorrect = false
    while (this.history.length < this.numGuesses) {
      var guess = this.guess(this.history.slice())
      isGuessCorrect = this.isGuessCorrect(guess)
      if (isGuessCorrect) {
        break
      } else {
        var response = this.respondToGuess(guess)
        this.history.push({
          guess: guess,
          response: response
        })
      }
    }
  }
}

class Cheater extends GameForMachines {
  guess () {
    return this.secret
  }
}

exports.Game = Game
exports.GameForHumans = GameForHumans
exports.GameForMachines = GameForMachines
exports.Cheater = Cheater
