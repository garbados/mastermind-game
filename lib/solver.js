var common = require('./common');
var _ = require('underscore');

function Solver (puzzle) {
  this.puzzle = puzzle;
  this.generate_all_codes();
}

Solver.prototype.generate_all_codes = function () {
  var i;
  var number_set = [];
  for (i = 1; i <= this.puzzle.secret_max; i++) {
    number_set.push(i);
  }

  var solution_matrix = [];
  for (i = 0; i < this.puzzle.secret_length; i++) {
    solution_matrix.push(number_set);
  }

  this.ALL_CODES = common.cartesianProductOf.apply(null, solution_matrix);
}

Solver.prototype.solve = function () {
  return this.knuth.apply(this, arguments);
}

// mastermind solver based on Donald Knuth's 1977 solution
// http://en.wikipedia.org/wiki/Mastermind_%28board_game%29#Five-guess_algorithm
Solver.prototype.knuth = function (announce, done) {
  var self = this;
  // solution subset we get to mess with
  var codes = [].concat(self.ALL_CODES);

  function judge (guess, secret) {
    return self.puzzle.judge.call({
      secret: secret
    }, guess);
  }

  function minimax_guess () {
    // get the highest number of solutions barred by a guess
    var max_counts = self.ALL_CODES.map(function (guess) {
      var counts = _.countBy(codes.map(judge.bind(self, guess)));
      return common.objectMax(counts);
    });
    var min = common.objectMin(max_counts);
    var guess_index = max_counts.indexOf(min);
    var guess = self.ALL_CODES[guess_index];
    console.log(min, guess);
    return guess;
  }


  var secret = this.puzzle.secret;
  var guess = this.ALL_CODES[0];
  while (true) {
    var feedback = judge(guess, secret);
    announce(guess, feedback);
    if (common.arraysEqual(guess, secret)) {
      break;
    } else {
      codes = codes.filter(function (code) {
        return common.objectsEqual(judge(guess, code), feedback);
      });
      if (codes.length === 1) {
        guess = codes[0];
      } else {
        guess = minimax_guess();
      }
    }
  }
};

module.exports = Solver;
