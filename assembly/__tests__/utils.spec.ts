import { BigNumber } from "../BigNumber";
import { BigInt } from "as-bigint";
import { TestCase } from "./testUtils/TestCase";
import { plannedTestCases } from "./testUtils/testCases";
import { randomTestCases } from "./testUtils/randomTestCases";

const testCases: TestCase[] = plannedTestCases.concat(randomTestCases);

describe("Utility methods", () => {

  it("isNegative", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      expect(x.isNegative).toStrictEqual(testCase.xIsNeg);
    }
  });

  it("isZero", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      expect(x.isZero()).toStrictEqual(testCase.xIsZero);
    }
  });

  it("isInteger", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      expect(x.isInteger).toStrictEqual(testCase.xIsInt);
    }
  });

  it("floor", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const xString = x.toString();
      expect(x.floor().toString()).toStrictEqual(xString.substring(0, xString.indexOf(".")));
    }
  });

  it("ceil", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const ceil: BigNumber = x.floor().add(new BigNumber(BigInt.ONE, 0, 0));
      expect(x.ceil().toString()).toStrictEqual(ceil.toString());
    }
  });

  it("min", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      const min: BigNumber = BigNumber.min(x, y);
      expect(min.toString()).toStrictEqual((testCase.xLTEy ? x : y).toString());
    }
  });

  it("max", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      const max: BigNumber = BigNumber.max(x, y);
      expect(max.toString()).toStrictEqual((testCase.xGTEy ? x : y).toString());
    }
  });

  it("setScale", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const newX = x.setScale(x.e / 2)
      expect(newX.e).toStrictEqual(x.e / 2);
      expect(x.eq(newX)).toBeTruthy();
    }
  });
});
