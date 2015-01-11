var chai = require('chai');
var lib;
try {
  lib = require('../cov');
} catch (e) {
  lib = require('../lib');
}

describe('mastermind', function () {
  describe('puzzle', function () {
    it('should make a secret', function () {
      var puzzle = new lib.Puzzle();
      chai.expect(puzzle.secret).to.have.length(puzzle.secret_length);
    });

    it('should determine a guess is correct', function () {
      var puzzle = new lib.Puzzle();
      var judgment = puzzle.judge(puzzle.secret);
      chai.expect(judgment.B).to.equal(puzzle.secret_length);
    });

    it('should determine a guess is not correct', function () {
      var puzzle = new lib.Puzzle();
      var guess = new Array(puzzle.secret_length).join(puzzle.secret[0]);
      var judgment = puzzle.judge(guess);
      chai.expect(judgment.W).to.above(0);
    });

    // TODO test prompt and play
  });
});
