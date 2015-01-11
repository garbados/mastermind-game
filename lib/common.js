var _ = require('underscore');

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

function objectsEqual (a, b) {
  return (JSON.stringify(a) === JSON.stringify(b));
}

function objectMax (obj) {
  var max = 0;
  
  Object.keys(obj).forEach(function (field) {
    if (obj[field] > max) max = obj[field];
  });

  return max;
}

function objectMin (obj) {
  var min = Infinity;
  
  Object.keys(obj).forEach(function (field) {
    if (obj[field] < min) min = obj[field];
  });

  return min;
}

function cartesianProductOf () {
  return _.reduce(arguments, function (a, b) {
    return _.flatten(_.map(a, function (x) {
      return _.map(b, function (y) {
        return x.concat([y]);
      });
    }), true);
  }, [ [] ]);
}

exports.arraysEqual = arraysEqual;
exports.objectsEqual = objectsEqual;
exports.objectMax = objectMax;
exports.objectMin = objectMin;
exports.cartesianProductOf = cartesianProductOf;
