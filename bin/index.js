#!/usr/bin/env node

var Game = require('../lib').GameForHumans
var pkg = require('../package.json')
var yargs = require('yargs')

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
var game = new Game({
  numChoices: argv.m,
  secretLength: argv.l,
  numGuesses: argv.g,
  secret: argv.secret ? argv.secret.split(',').map(function (n) { return parseInt(n) }) : undefined
})
game.play()
