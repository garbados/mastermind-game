var prompt = require('prompt');
var async = require('async');

function Puzzler (length, max) {
  this.secret_length = length || 4;
  this.secret_max = max || 6;
  this.secret = this.make_secret();
}

Puzzler.prototype.make_secret = function () {
  var secret = [];
  for (var i = 0; i < this.secret_length; i++) {
    var num = Math.floor(Math.random() * this.secret_max);
    secret.push(num);
  }
  return secret;
};

Puzzler.prototype.judge = function (guess) {
  var self = this;
  var result = {
    B: 0,
    W: 0
  };
  
  guess.forEach(function (num, i) {
    console.log(i, num, self.secret.indexOf(num));
    if (self.secret.indexOf(num) === i) {
      result.B++
    } else if (self.secret.indexOf(num) >= 0) {
      result.W++
    }
  });
  return result;
};

Puzzler.prototype.prompt = function (done) {
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

Puzzler.prototype.play = function (announce, done) {
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

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

module.exports = Puzzler;
