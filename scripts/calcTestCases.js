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
    sum: bnX.plus(bnY).toFixed(50),
    difference: bnX.minus(bnY).toFixed(50),
    product: bnX.times(bnY).toFixed(50),
    quotient: bnX.div(bnY).toFixed(50),
    sqrtX: bnX.sqrt().toFixed(50),
    sqrtY: bnY.sqrt().toFixed(50),
    xSquare: bnX.pow(2).toFixed(50),
    xCube: bnX.pow(3).toFixed(50),
    xGTy: bnX.gt(bnY),
    xLTy: bnX.lt(bnY),
    xGTEy: bnX.gte(bnY),
    xLTEy: bnX.lte(bnY),
    xEQy: bnX.eq(bnY),
    xCTy: bnX.comparedTo(bnY),
    xIsNeg: bnX.isNegative(),
    xIsZero: bnX.isZero(),
    xIsInt: bnX.isInteger(),
  })
}

fs.writeFileSync(outputPath, JSON.stringify(cases, null, 2));