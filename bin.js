#!/usr/bin/env node
'use strict'

var Game = require('.').Game
var pkg = require('./package.json')
var prompt = require('prompt')
var Table = require('cli-table2')
var yargs = require('yargs')

function log (msg) {
  if (process.env.DEBUG || process.env.LOG) {
    console.log(`[${pkg.name}] ${msg}`)
  }
}

function debug (msg) {
  if (process.env.DEBUG) {
    console.log(`[${pkg.name}] ${msg}`)
  }
}

class GameForHumans extends Game {
  preparePrompt () {
    debug(`The secret is: ${this.secret.join(' ')}`)
    log(`The ceiling for values is: ${this.numChoices}`)
    log(`The number of allowed guesses is: ${this.numGuesses}`)
    prompt.message = ''
    prompt.delimiter = ''
    prompt.colors = false
    prompt.start()
    this._promptReady = true
  }

  /**
   * Takes a string containing digits and
   * converts it to an array of numbers.
   *
   * When this.numChoices is greater than 9,
   * numbers will require spaces as delimiters.
   * Otherwise, each digit will be parsed
   * as a separate number.
   *
   * @param  {String} rawGuess A string of digits provided by the user.
   * @return {Array<Number>}
   */
  formatGuess (rawGuess) {
    log(`Raw guess: ${JSON.stringify(rawGuess)}`)
    let guess = rawGuess
      .split(/ ?/)
      .filter(d => /\d/.test(d))
      .slice(0, this.secretLength)
      .map(n => parseInt(n))
    log(`Guess: ${JSON.stringify(guess)}`)
    return guess
  }

  promptGuess (done) {
    if (!this._promptReady) this.preparePrompt()
    const msg = `A guess requires ${this.secretLength} digits between (inclusive!) 1 and ${this.numChoices} separated by spaces.`
    prompt
      .get({
        properties: {
          guess: {
            description: 'Please enter your guess:',
            message: msg,
            required: true,
            type: 'string',
            pattern: new RegExp(`([1-${this.numChoices}] ?){${this.secretLength}}`),
            before: this.formatGuess.bind(this)
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

    function handleGuess (guess) {
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
    }

    function handlePrompt (err, guess, done) {
      if (err) return done(err)
      var advance = handleGuess.call(this, guess)
      if (advance) {
        var next = handlePrompt.bind(this)
        this.promptGuess(function (err, guess) {
          next(err, guess, done)
        })
      }
    }

    // get each turn's guess
    console.log('Do you want to play a game?')
    console.log('')
    console.log(`I am thinking of a sequence of ${this.secretLength} numbers between 1 and ${this.numChoices}.`)
    console.log(`Can you guess the sequence in fewer than ${this.numGuesses} guesses?`)
    console.log('')
    this.promptGuess(handlePrompt.bind(this))
  }
}

// yarr
var argv = yargs
  .version('v', pkg.version)
  .usage('Usage: ' + pkg.name + ' [action] [-l, --length] [-m, --max]')
  .example(pkg.name, 'Play a game with default options.')
  .example(pkg.name + ' -l 15 -m 25', 'Play a game a 15-length secret with integers from 1 to 25.')
  .example(pkg.name + ' --secret 2,1,2,2', 'Play a game using 2 1 2 2 as the secret sequence.')
  // secret sequence length
  .default('length', Game.SECRET_LENGTH)
  .alias('l', 'length')
  .describe('l', 'Number of elements in the secret number sequence.')
  // max value for secret sequence elements
  .default('max', Game.NUM_CHOICES)
  .alias('m', 'max')
  .describe('m', 'Maximum number a secret number can be.')
  // maximum turns before losing
  .default('guesses', Game.NUM_GUESSES)
  .alias('g', 'guesses')
  .describe('g', 'Number of guesses allowed the user before they lose.')
  // allow choice of secret
  .describe('secret', 'Specify the secret used in the game. Separate numbers with commas!')
  .alias('S', 'secret')
  // enable help
  .help('h')
  .alias('h', 'help')
  .argv

// LET THE GAMES BEGIN
var game = new GameForHumans({
  numChoices: argv.m,
  secretLength: argv.l,
  numGuesses: argv.g,
  secret: argv.secret ? argv.secret.split(',').map(function (n) { return parseInt(n) }) : undefined
})
game.play()
