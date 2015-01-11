#!/usr/bin/env node

var Puzzler = require('../lib/puzzler');
var yargs = require('yargs');
var argv = yargs.argv;

switch (argv._[0]) {
  case 'play':
    var puzzle = new Puzzler(argv._[1], argv._[2]);
    console.log('Now playing with');
    console.log('* ' + puzzle.secret_length + '-character secret');
    console.log('* integers from 1 to ' + puzzle.secret_max);
    console.log('Guess with spaces between integers, ex: 1 2 3 4');
    console.log('To exit, press CTRL-C.')
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
  case 'watch':
    console.error('Solver AI not yet implemented :(');
    break;
  case 'help':
    console.log(yargs.help());
    break;
  default:
    console.error(argv._[0], 'is not a recognized command :(');
    console.error(yargs.help());
    break;
}
