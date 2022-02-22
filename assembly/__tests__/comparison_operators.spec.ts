import { BigNumber } from "../BigNumber";
import { TestCase } from "./testUtils/TestCase";
import { plannedTestCases } from "./testUtils/testCases";
import { randomTestCases } from "./testUtils/randomTestCases";

const testCases: TestCase[] = plannedTestCases.concat(randomTestCases);

describe("Comparison operations", () => {

  it("Compares equal positive numbers", () => {
    // equals
    const intA = "100000000000000000000000000000000000000000000000000.34";
    const intB = "100000000000000000000000000000000000000000000000000.34";
    const biA = BigNumber.fromString(intA);
    const biB = BigNumber.fromString(intB);
    expect(biA.eq(biB)).toStrictEqual(true);
    expect(biA.lt(biB)).toStrictEqual(false);
    expect(biA.lte(biB)).toStrictEqual(true);
    expect(biA.gt(biB)).toStrictEqual(false);
    expect(biA.gte(biB)).toStrictEqual(true);
    
    const intC = "0.34256";
    const intD = "0.34256";
    const biC = BigNumber.fromString(intC);
    const biD = BigNumber.fromString(intD);
    expect(biC.eq(biD)).toStrictEqual(true);
    expect(biC.lt(biD)).toStrictEqual(false);
    expect(biC.lte(biD)).toStrictEqual(true);
    expect(biC.gt(biD)).toStrictEqual(false);
    expect(biC.gte(biD)).toStrictEqual(true);
  });

  it("Compares unequal positive numbers", () => {
    // less than, greater than
    const intA = "100000000000000000000000000000000000000000000000000.652352352352523";
    const intB = "10000000000000000000000000000000000000000000000000.9435973496738539";
    const biA = BigNumber.fromString(intA);
    const biB = BigNumber.fromString(intB);
    // greater compared to lesser
    expect(biA.eq(biB)).toStrictEqual(false);
    expect(biA.lt(biB)).toStrictEqual(false);
    expect(biA.lte(biB)).toStrictEqual(false);
    expect(biA.gt(biB)).toStrictEqual(true);
    expect(biA.gte(biB)).toStrictEqual(true);
    // lesser compared to greater
    expect(biB.lt(biA)).toStrictEqual(true);
    expect(biB.lte(biA)).toStrictEqual(true);
    expect(biB.gt(biA)).toStrictEqual(false);
    expect(biB.gte(biA)).toStrictEqual(false);

    // less than, greater than
    const intC = "0.9857463";
    const intD = "0.87846543859709";
    const biC = BigNumber.fromString(intC);
    const biD = BigNumber.fromString(intD);
    // greater compared to lesser
    expect(biC.eq(biD)).toStrictEqual(false);
    expect(biC.lt(biD)).toStrictEqual(false);
    expect(biC.lte(biD)).toStrictEqual(false);
    expect(biC.gt(biD)).toStrictEqual(true);
    expect(biC.gte(biD)).toStrictEqual(true);
    // lesser compared to greater
    expect(biD.lt(biC)).toStrictEqual(true);
    expect(biD.lte(biC)).toStrictEqual(true);
    expect(biD.gt(biC)).toStrictEqual(false);
    expect(biD.gte(biC)).toStrictEqual(false);
  });

  it("Compares equal negative numbers", () => {
    // negative equality
    const intA = "-100000000000000000000000000000000000000000000000000.23462346";
    const intB = "-100000000000000000000000000000000000000000000000000.23462346";
    const biA = BigNumber.fromString(intA);
    const biB = BigNumber.fromString(intB);
    expect(biA.eq(biB)).toStrictEqual(true);
    expect(biA.lt(biB)).toStrictEqual(false);
    expect(biA.lte(biB)).toStrictEqual(true);
    expect(biA.gt(biB)).toStrictEqual(false);
    expect(biA.gte(biB)).toStrictEqual(true);

    const intC = "-0.23462346";
    const intD = "-0.23462346";
    const biC = BigNumber.fromString(intC);
    const biD = BigNumber.fromString(intD);
    expect(biC.eq(biD)).toStrictEqual(true);
    expect(biC.lt(biD)).toStrictEqual(false);
    expect(biC.lte(biD)).toStrictEqual(true);
    expect(biC.gt(biD)).toStrictEqual(false);
    expect(biC.gte(biD)).toStrictEqual(true);
  });

  it("Compares unequal negative numbers", () => {
    // both numbers are negative
    const intA = "-10000000000000000000000000000000000000000000000000.235136434";
    const intB = "-100000000000000000000000000000000000000000000000000.4573875645";
    const biA = BigNumber.fromString(intA);
    const biB = BigNumber.fromString(intB);
    // greater compared to lesser
    expect(biA.eq(biB)).toStrictEqual(false);
    expect(biA.lt(biB)).toStrictEqual(false);
    expect(biA.lte(biB)).toStrictEqual(false);
    expect(biA.gt(biB)).toStrictEqual(true);
    expect(biA.gte(biB)).toStrictEqual(true);
    // lesser compared to greater
    expect(biB.lt(biA)).toStrictEqual(true);
    expect(biB.lte(biA)).toStrictEqual(true);
    expect(biB.gt(biA)).toStrictEqual(false);
    expect(biB.gte(biA)).toStrictEqual(false);

    // both numbers are negative
    const intC = "-0.235136434";
    const intD = "-0.4573875645";
    const biC = BigNumber.fromString(intC);
    const biD = BigNumber.fromString(intD);
    // greater compared to lesser
    expect(biC.eq(biD)).toStrictEqual(false);
    expect(biC.lt(biD)).toStrictEqual(false);
    expect(biC.lte(biD)).toStrictEqual(false);
    expect(biC.gt(biD)).toStrictEqual(true);
    expect(biC.gte(biD)).toStrictEqual(true);
    // lesser compared to greater
    expect(biD.lt(biC)).toStrictEqual(true);
    expect(biD.lte(biC)).toStrictEqual(true);
    expect(biD.gt(biC)).toStrictEqual(false);
    expect(biD.gte(biC)).toStrictEqual(false);
  });

  it("Compares unequal numbers with opposite signs", () => {
    // one negative number
    const intA = "100000000000000000000000000000000000000000000000000.24647246234";
    const intB = "-100000000000000000000000000000000000000000000000000.79768374";
    const biA = BigNumber.fromString(intA);
    const biB = BigNumber.fromString(intB);
    // greater compared to lesser
    expect(biA.eq(biB)).toStrictEqual(false);
    expect(biA.lt(biB)).toStrictEqual(false);
    expect(biA.lte(biB)).toStrictEqual(false);
    expect(biA.gt(biB)).toStrictEqual(true);
    expect(biA.gte(biB)).toStrictEqual(true);
    // lesser compared to greater
    expect(biB.lt(biA)).toStrictEqual(true);
    expect(biB.lte(biA)).toStrictEqual(true);
    expect(biB.gt(biA)).toStrictEqual(false);
    expect(biB.gte(biA)).toStrictEqual(false);

    // one negative number
    const intC = "0.24647246234";
    const intD = "-0.79768374";
    const biC = BigNumber.fromString(intC);
    const biD = BigNumber.fromString(intD);
    // greater compared to lesser
    expect(biC.eq(biD)).toStrictEqual(false);
    expect(biC.lt(biD)).toStrictEqual(false);
    expect(biC.lte(biD)).toStrictEqual(false);
    expect(biC.gt(biD)).toStrictEqual(true);
    expect(biC.gte(biD)).toStrictEqual(true);
    // lesser compared to greater
    expect(biD.lt(biC)).toStrictEqual(true);
    expect(biD.lte(biC)).toStrictEqual(true);
    expect(biD.gt(biC)).toStrictEqual(false);
    expect(biD.gte(biC)).toStrictEqual(false);
  });

  it("compares test cases", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      expect(x.compareTo(y)).toStrictEqual(testCase.xCTy);
      expect(x.eq(y)).toStrictEqual(testCase.xEQy);
      expect(x.lt(y)).toStrictEqual(testCase.xLTy);
      expect(x.lte(y)).toStrictEqual(testCase.xLTEy);
      expect(x.gt(y)).toStrictEqual(testCase.xGTy);
      expect(x.gte(y)).toStrictEqual(testCase.xGTEy);
    }
  });
  
});