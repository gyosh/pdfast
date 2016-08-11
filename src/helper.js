'use strict';

module.exports.isNumber = function (x) {
  return (typeof x === 'number');
};

module.exports.findMin = function (arr) {
  var curr = arr[0];
  for (var i = 1; i < arr.length; i++) {
    curr = Math.min(curr, arr[i]);
  }
  return curr;
};

module.exports.findMax = function (arr) {
  var curr = arr[0];
  for (var i = 1; i < arr.length; i++) {
    curr = Math.max(curr, arr[i]);
  }
  return curr;
};
