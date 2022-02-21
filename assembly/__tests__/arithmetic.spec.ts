import { BigNumber } from "../BigNumber";
import { TestCase } from "./testUtils/TestCase";
import { plannedTestCases } from "./testUtils/testCases";
import { randomTestCases } from "./testUtils/randomTestCases";

const testCases: TestCase[] = plannedTestCases.concat(randomTestCases);

describe("BigNumber simple arithmetic", () => {

  it("adds", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      const result = x.add(y).toFixed(30);
      const expected = BigNumber.fromString(testCase.sum, 600).toFixed(30);
      expect(result).toStrictEqual(expected);
    }
  });

  it("subtracts", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      const result = x.sub(y).toFixed(30);
      const expected = BigNumber.fromString(testCase.difference).toFixed(30);
      expect(result).toStrictEqual(expected);
    }
  });

  it("multiplies", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      const result = x.mul(y).toFixed(30);
      const expected = BigNumber.fromString(testCase.product).toFixed(30);
      expect(result).toStrictEqual(expected);
    }
  });

  it("divides", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      const y = BigNumber.fromString(testCase.y);
      if (y.isZero()) {
        continue;
      }
      const result = x.div(y).toFixed(30);
      const expected = BigNumber.fromString(testCase.quotient).toFixed(30);
      expect(result).toStrictEqual(expected);
    }
  });

});
