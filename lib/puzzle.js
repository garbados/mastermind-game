var prompt = require('prompt');
var async = require('async');
var arraysEqual = require('./common').arraysEqual;

function Puzzle (length, max) {
  this.secret_length = length || 4;
  this.secret_max = max || 6;
  this.secret = this.make_secret();
}

Puzzle.prototype.make_secret = function () {
  var secret = [];
  for (var i = 0; i < this.secret_length; i++) {
    var num = Math.floor(Math.random() * this.secret_max);
    secret.push(num);
  }
  return secret;
};

Puzzle.prototype.judge = function (guess) {
  var self = this;
  var temp_secret = [].concat(self.secret);
  var result = {
    B: 0,
    W: 0
  };
  
  guess.forEach(function (num, i) {
    if (temp_secret.indexOf(num) === i) {
      temp_secret[i] = null; // so that aabb doesn't report BWWW for abcd
      result.B++;
    } else if (self.secret.indexOf(num) >= 0) {
      result.W++;
    }
  });
  return result;
};

Puzzle.prototype.prompt = function (done) {
  var self = this;
  prompt.start();
  prompt.message = '';
  prompt.delimiter = '';
  prompt.get(['guess'], function (err, result) {
    if (err) 
      done(err);
    else
      done(null, result.guess
                       .split(' ')
                       .map(Number));
                       });
};

Puzzle.prototype.play = function (announce, done) {
  var self = this;
  var judgment;
  var guess;
  async.forever(function (done) {
    self.prompt(function (err, new_guess) {
      if (err) 
        done(err);
      else if (arraysEqual(new_guess, self.secret)) {
        done(true);
      } else {
        judgment = self.judge(new_guess);
        announce(judgment);
        guess = new_guess;
        done();
      }
    });
  }, function (err) {
    if (err === true) {
      done();
    } else {
      done(err);
    }
  });
};

module.exports = Puzzle;
