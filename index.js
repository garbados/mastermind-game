/**
 * Contains classes for playing Mastermind
 * and strategies that play it for you!
 * @module mastermind-game
 */
'use strict'

const NUM_CHOICES = 6
const SECRET_LENGTH = 4
const NUM_GUESSES = 12
const ERR_NOT_IMPLEMENTED = 'Not implemented.'

/**
 * Base class for games and strategies.
 * Sub-classes must implement `.play()`
 * or else you won't be able to play them!
 * @abstract
 */
class Game {
  /** @type {number} */
  static get NUM_CHOICES () { return NUM_CHOICES }
  /** @type {number} */
  static get SECRET_LENGTH () { return SECRET_LENGTH }
  /** @type {number} */
  static get NUM_GUESSES () { return NUM_GUESSES }

  /** @type {number} */
  get numChoices () { return this._opts.numChoices }
  /** @type {number} */
  get secretLength () { return this._opts.secretLength }
  /** @type {number} */
  get numGuesses () { return this._opts.numGuesses }

  constructor (opts) {
    opts = opts || {}
    this._opts = {}
    this._opts.numChoices = opts.numChoices || Game.NUM_CHOICES
    this._opts.secretLength = opts.secretLength || Game.SECRET_LENGTH
    this._opts.numGuesses = opts.numGuesses || Game.NUM_GUESSES
    this.secret = opts.secret || this.makeSecret(this._opts.numChoices, this._opts.secretLength)
  }

  /**
   * Generate a secret sequence of length `secretLength`
   * composed of integers between 1 and `numChoices`.
   * @param  {Number} numChoices   The maximum value for elements of the secret sequence.
   * @param  {Number} secretLength The length of the secret to be generated.
   * @return {Array}               A secret sequence!
   */
  makeSecret (numChoices, secretLength) {
    var secret = []
    for (var i = 0; i < secretLength; i++) {
      secret.push(Math.floor(Math.random() * numChoices) + 1)
    }
    return secret
  }

  /**
   * Evaluate a guess against the secret sequence,
   * returning an object with two properties:
   *
   * - `correctPosition`: the number of numbers that have both the correct value and correct position.
   * - `correctNumber`: the number of numbers that have the correct value but wrong position.
   *
   * For example, if the secret were [2, 1, 2, 2] and you guessed [1, 2, 3, 2]
   * the response would be `{ correctPosition: 1, correctNumber: 2 }`.
   * @example
   * var secret = [2, 1, 2, 2]
   * var guess = [1, 2, 3, 2]
   * var game = new Game({ secret: secret })
   * var response = game.evaluateGuess(guess)
   * // response.correctPosition = 1
   * // response.correctNumber = 2
   * @param  {Array} guess A guess at the secret sequence.
   * @return {Object}      Response to the guess: `{ correctPosition: Number, correctNumber: Number }`
   */
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

  /**
   * Returns whether the guess matches the secret sequence.
   * @param  {Array}  guess A guess at the secret sequence.
   * @return {Boolean}      Whether the guess matches the secret sequence (`true`) or not (`false`).
   */
  isGuessCorrect (guess) {
    return this.secret.reduce(function (a, b, i) {
      return a && (guess[i] === b)
    }, true)
  }

  /**
   * Play the game!
   * Sub-classes must implement this method,
   * or they won't know how to play the game!
   * @abstract
   * @return {Error} An error! This method must be implemented by a sub-class.
   */
  play () {
    throw new Error(ERR_NOT_IMPLEMENTED)
  }
}

/**
 * An interface for implementing strategies
 * that play the game.
 * Sub-classes must implement `.guess()`
 * in order to play the game!
 *
 * For example:
 *
 * ```javascript
 * const {GameForMachines} = require('mastermind-game')
 *
 * class YourStrategy extends GameForMachines {
 *   // guesses randomly, regardless of past guesses
 *   guess (history) {
 *     let guess = []
 *     for (var i = 0; i < this.secretLength; i++) {
 *       guess.push(Math.floor(Math.random() * this.numChoices))
 *     }
 *     return guess
 *   }
 * }
 * ````
 * @implements {Game}
 */
class GameForMachines extends Game {
  constructor (opts) {
    super(opts)
    this.history = []
  }

  /**
   * The abstract method that sub-classes must implement
   * in order to generate guesses.
   * For more information on the `response` object in each turn's history,
   * see [Game#evaluateGuess]{@link Game}.
   * @abstract
   * @param  {Array}  history A history of the guesses so far: `[{ guess: [...], response: {...} }, ...]`
   * @param  {Array}  history[].guess    An array of numbers representing the guess made in a particular turn.
   * @param  {Object} history[].response A response generated by `Game#evaluateGuess()` to the guess made that turn.
   * @return {Error}  An error! This method must be implemented by a sub-class.
   */
  guess (history) {
    throw new Error(ERR_NOT_IMPLEMENTED)
  }

  /**
   * Plays the game using the class method `.guess()` to generate guesses.
   * Modifies `this.history` to reflect the guesses (and responses) made during the game.
   * Returns a boolean indicating victory.
   * @return {Boolean} Whether the strategy won the game (`true`) or not (`false`).
   */
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

/**
 * A strategy that wins on the first guess
 * by inspecting the game's secret!
 * Kind of an example strategy.
 * @implements {GameForMachines}
 */
class Cheater extends GameForMachines {
  /**
   * Guesses the game's secret sequence -- by returning the secret itself!
   * What a cheater!
   * @return {Array} The game's secret itself! Gah!
   */
  guess () {
    return this.secret
  }
}

/**
 * A strategy that always guesses wrong!
 * Kind of an example strategy;
 * mainly to help with testing.
 * @implements {GameForMachines}
 */
class Loser extends GameForMachines {
  /**
   * Guesses the game's secret sequence -- by inspecting the secret
   * and returning a guess with all incorrect values, but which
   * are still valid.
   * @return {Array} A wrong guess at the game's secret.
   */
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
