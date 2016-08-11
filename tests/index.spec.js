'use strict';

var EPS = 1e-3;

var _ = require('lodash');
var rewire = require('rewire');
var expect = require('chai').expect;

var statisticUtil = rewire('../src');

describe('statistic util', function () {
  context('create', function () {
    var arr = [1, 1, 1, 2, 3, 3, 6, 6, 6, 6, 6, 6, 9, 9, 9, 9, 12];

    context('triangle', function () {
      var expected = [
        { x: 1, y: 0.18627450980392157 },
        { x: 2.2222222222222223, y: 0.1372549019607843 },
        { x: 3.4444444444444446, y: 0.029411764705882353 },
        { x: 4.666666666666667, y: 0.08823529411764706 },
        { x: 5.888888888888889, y: 0.17647058823529413 },
        { x: 7.111111111111112, y: 0.14705882352941177 },
        { x: 8.333333333333334, y: 0.11764705882352941 },
        { x: 9.555555555555557, y: 0.058823529411764705 },
        { x: 10.777777777777779, y: 0.0196078431372549 },
        { x: 12, y: 0.0392156862745098 }
      ];

      it('should work', function () {
        var result = statisticUtil.create(arr, {
          width: 2,
          size: 10,
          min: 1,
          max: 12,
          kernel: 'triangle'
        });

        var sum = _.reduce(result, function (acc, item) {
          return acc + item.y;
        }, 0);

        expect(sum).closeTo(1, EPS);
        result.forEach(function (item, i) {
          expect(item.x).closeTo(expected[i].x, EPS);
          expect(item.y).closeTo(expected[i].y, EPS);
        });
      });

      it('should return empty array for empty input', function () {
        var result = statisticUtil.create([], {width: 2, size: 10, fast: false});
        expect(result).to.deep.equal([]);
      });

      it('should return 100% accuracy pdf for homogen input', function () {
        expect(
          statisticUtil.create([12, 12, 12], {width: 2, size: 10, fast: false})
        ).to.deep.equal([{x: 12, y: 1}]);

        expect(
          statisticUtil.create([-1, -1, -1], {width: 2, size: 10, fast: false})
        ).to.deep.equal([{x: -1, y: 1}]);
      });
    });
  });

  context('generatePartialAreas', function () {
    var generatePartialAreas = statisticUtil.__get__('generatePartialAreas');
    var mockFunction = function (x) {
      return Math.abs(x);
    };

    it('should work', function () {
      var expected = {
        "-3": 1,
        "-2": 1.6666666666666665,
        "-1": 1.9999999999999998,
        "0": 1.9999999999999998,
        "1": 2.333333333333333,
        "2": 2.9999999999999996,
        "3": 3.9999999999999996
      };

      var result = generatePartialAreas(mockFunction, 3);

      _.keys(expected).forEach(function (key) {
        expect(result[key]).closeTo(expected[key], EPS);
      });
    });
  });

  context('getExpectedValueFromPdf', function () {
    it('should return undefined for empty pdf', function () {
      expect(
        statisticUtil.getExpectedValueFromPdf([])
      ).equal(undefined);
    });

    it('should return expected value for typical pdf', function () {
      expect(
        statisticUtil.getExpectedValueFromPdf([{x: 12, y: 1}])
      ).equal(12);

      expect(
        statisticUtil.getExpectedValueFromPdf([
          {x: 1, y: 0.2},
          {x: 2, y: 0.4},
          {x: 3, y: 0.3},
          {x: 4, y: 0.075},
          {x: 5, y: 0.025}
        ])
      ).equal(2.3249999999999997);
    });
  });

  context('getXWithLeftTailArea', function () {
    it('should return undefined for empty pdf', function () {
      expect(
        statisticUtil.getXWithLeftTailArea([], 12)
      ).equal(undefined);
    });

    it('should return the only x for any area for 100% accuracy pdf', function () {
      var pdf = [{x: 12, y: 1}];

      expect(statisticUtil.getXWithLeftTailArea(pdf, 0)).equal(12);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.5)).equal(12);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.8)).equal(12);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 1)).equal(12);
    });

    it('should return x position where left tail area equals given param', function () {
      var pdf = [
        {x: 1, y: 0.2},
        {x: 2, y: 0.4},
        {x: 3, y: 0.3},
        {x: 4, y: 0.075},
        {x: 5, y: 0.025}
      ];

      expect(statisticUtil.getXWithLeftTailArea(pdf, 0)).equal(1);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.12)).equal(1);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.19)).equal(1);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.21)).equal(2);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 0.95)).equal(4);
      expect(statisticUtil.getXWithLeftTailArea(pdf, 1)).equal(5);
    });
  });
});

