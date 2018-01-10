#!/usr/bin/env node

var async = require('async')
var Game = require('.').Game
var pkg = require('./package.json')
var prompt = require('prompt')
var Table = require('cli-table2')
var yargs = require('yargs')

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
    console.log('Do you want to play a game?')
    console.log('')
    console.log('I am thinking of a sequence of %i numbers between 1 and %i.', this.secretLength, this.numChoices)
    console.log('Can you guess the sequence?')
    console.log('')
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

// yarr
var argv = yargs
  .version('v', pkg.version)
  .usage('Usage: ' + pkg.name + ' [action] [-l, --length] [-m, --max]')
  .example(pkg.name, 'Play a game with default options.')
  .example(pkg.name + ' -l 15 -m 25', 'Play a game a 15-length secret with integers from 1 to 25.')
  .example(pkg.name + ' --secret 2,1,2,2', 'Play a game using [ 2, 1, 2, 2 ] as the secret sequence.')
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
  .describe('secret', 'Specify the secret used in the game. Use comma-separated values!')
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
