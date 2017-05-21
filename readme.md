# mastermind-game

[![Build Status](https://travis-ci.org/garbados/mastermind-game.svg)](https://travis-ci.org/garbados/mastermind-game)
[![Coverage Status](https://coveralls.io/repos/github/garbados/mastermind-game/badge.svg?branch=master)](https://coveralls.io/github/garbados/mastermind-game?branch=master)
[![npm version](https://badge.fury.io/js/mastermind-game.svg)](https://www.npmjs.com/package/mastermind-game)

![Mastermind!](https://upload.wikimedia.org/wikipedia/commons/2/2d/Mastermind.jpg)

Play [Mastermind](https://en.wikipedia.org/wiki/Mastermind_%28board_game%29) in your terminal!

## Install

To play, you'll need [node.js](https://nodejs.org/) installed. Then, use [npm](https://www.npmjs.com/) to install:

	npm install -g mastermind-game

Then, just type this in your terminal:

	mastermind-game

...and the game will begin!

It looks like this:

```
> mastermind-game
Let's play a game...
I'm thinking of 4 numbers between 1 and 6.
Can you guess the sequence?
Please enter your guess: 1 1 2 2
┌─────────┬──────────────────┬────────────────┐
│ Guess   │ Correct Position │ Correct Number │
├─────────┼──────────────────┼────────────────┤
│ 1 1 2 2 │ 2                │ 0              │
└─────────┴──────────────────┴────────────────┘
Please enter your guess:
```

For more information, try `mastermind-game -h` or `mastermind-game --help`!

## Writing Strategies

You can use `mastermind-game` as a module and write your own strategies! Install it like so:

  npm install --save mastermind-game

Then, sub-class `GameForMachines` and implement `.guess()`:

```javascript
var mastermind = require('mastermind-game')

class MyStrategy extends mastermind.GameForMachines {
  guess (history) {
    // write your strategy's logic here!
  }
}
```

Check the [docs](https://garbados.github.io/mastermind-game) for more information on writing strategies.

## Tests

Download the project's source in order to run the test suite:

	git clone https://github.com/garbados/mastermind-game.git
	cd mastermind-game
	npm install
	npm test

You can run `npm run cov` to see a report of test coverage.

## Contributing

If you'd like to help but you're not sure where to start, poke around the [issues list](https://github.com/garbados/mastermind-game/issues) on GitHub.

To contribute patches, fork the code and make a Pull Request with your changes.

If you write a strategy for playing the game, please let me know by [filing an issue](https://github.com/garbados/mastermind-game/issues/new) about it!
