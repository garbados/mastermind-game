#!/usr/bin/env node

var pjson = require('../package.json');
var Puzzle = require('../lib/puzzle');
var yargs = require('yargs')
            .usage('Usage: ' + pjson.name + ' [action] [-l, --length] [-m, --max]')
            .example(pjson.name, 'play a game with a 4-length secret with integers from 1 to 6')
            .example(pjson.name + ' -l 15 -m 25', 'play a game a 15-length secret with integers from 1 to 25')
            .default('length', 4)
            .alias('l', 'length')
            .describe('l', 'number of numbers in the secret number sequence')
            .default('max', 6)
            .alias('m', 'max')
            .describe('m', 'the maximum number a secret number can be')
            .demand(1)
            .version('v' + pjson.version + '\n', 'version');
var argv = yargs.argv;

switch (argv._[0]) {
  case 'watch':
    // TODO fix once solver is implemented
    console.error('Solver is not yet implemented :(');
    break;
  case 'help':
    console.log(yargs.help());
    break;
  default:
    var puzzle = new Puzzle(argv.length, argv.max);
    console.log('Now playing with');
    console.log('* ' + puzzle.secret_length + '-character secret');
    console.log('* integers from 1 to ' + puzzle.secret_max);
    console.log('Guess with spaces between integers, ex: 1 2 3 4');
    console.log('To exit, press CTRL-C.');
    console.log('Have fun!');
    var rounds = 0;
    if (argv.cheat)
      console.log('PSST the secret is', puzzle.secret.join(' '));
    puzzle.play(function (judgment) {
      rounds++;
      console.log('B:', judgment.B);
      console.log('W:', judgment.W);
    }, function (err) {
      if (err) {
        if (err.message === 'canceled') {
          console.log('');
          console.log('Bye!');
        } else {
          throw new Error(err);
        }
      } else {
        console.log('You win!');
        // TODO high scores
        console.log('Rounds:', rounds);
        console.log('Good job <3'); 
      }
    });
    break;
}
