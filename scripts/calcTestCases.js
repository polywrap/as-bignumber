const fs = require("fs");
const BN = require("bignumber.js");
const path = require("path");

const outputPath = path.resolve(process.argv[3]);
const inputPath = path.resolve(process.argv[2]);
const caseInputs = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// configure bignumber.js
BN.config({
  DECIMAL_PLACES: 1000,
  ROUNDING_MODE: BN.ROUND_HALF_UP,
  EXPONENTIAL_AT: 1e9,
  RANGE: 1e9,
})

// create test cases
const cases = [];
for ({ x, y } of caseInputs) {
  const bnX = new BN(x);
  const bnY = new BN(y);
  cases.push({
    x: x.toString(),
    y: y.toString(),
    sum: bnX.plus(bnY).toFixed(35),
    difference: bnX.minus(bnY).toFixed(35),
    product: bnX.times(bnY).toFixed(35),
    quotient: bnX.div(bnY).toFixed(35),
    sqrtX: bnX.sqrt().toFixed(35),
    sqrtY: bnY.sqrt().toFixed(35),
    xSquare: bnX.pow(2).toFixed(35),
    xCube: bnX.pow(3).toFixed(35),
    xGTy: bnX.gt(bnY),
    xLTy: bnX.lt(bnY),
    xGTEy: bnX.gte(bnY),
    xLTEy: bnX.lte(bnY),
    xEQy: bnX.eq(bnY),
    xCTy: bnX.comparedTo(bnY),
    absX: bnX.abs().toFixed(35),
    negX: bnX.negated().toFixed(35),
    xIsNeg: bnX.isNegative(),
    xIsZero: bnX.isZero(),
    xIsInt: bnX.isInteger(),
  })
}

fs.writeFileSync(outputPath, JSON.stringify(cases, null, 2));