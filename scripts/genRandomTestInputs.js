const fs = require("fs");
const BN = require("bignumber.js");
const path = require("path");

const MAX_U128 = "340282366920938463463374607431768211455";
//const MAX_U256 = "115792089237316195423570985008687907853269984665640564039457584007913129639936";
//const MAX_U512 = "13407807929942597099574024998205846127479365820592393377723561443721764030073546976801874298166903427690031858186486050853753882811946569946433649006084095";

const outputPath = path.resolve(process.argv[2]);
const numCases = Number.parseInt(process.argv[3]) / 3;

// configure bignumber.js
BN.config({
  DECIMAL_PLACES: 160,
  ROUNDING_MODE: BN.ROUND_HALF_UP,
  EXPONENTIAL_AT: [-360, 360],
})

// create test cases
const caseInputs = [];
for (let i = 0; i < numCases; i++) {
  const negX = BN.random(2).lt(0.5) ? -1 : 1
  const negY = BN.random(2).lt(0.5) ? -1 : 1
  caseInputs.push({
    x: BN.random(18).times(1).times(negX).toFixed(18),
    y: BN.random(18).times(1).times(negY).toFixed(18),
  })
  caseInputs.push({
    x: BN.random(18).times(1).times(negX).toFixed(18),
    y: BN.random(18).times(MAX_U128).times(negY).toFixed(18),
  })
  caseInputs.push({
    x: BN.random(18).times(MAX_U128).times(negX).toFixed(18),
    y: BN.random(18).times(MAX_U128).times(negY).toFixed(18),
  })
}

fs.writeFileSync(outputPath, JSON.stringify(caseInputs, null, 2));