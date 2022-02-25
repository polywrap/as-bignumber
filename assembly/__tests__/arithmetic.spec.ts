import { BigNumber } from "../BigNumber";
import { TestCase } from "./testUtils/TestCase";
import { plannedTestCases } from "./testUtils/testCases";
import { randomTestCases } from "./testUtils/randomTestCases";

const testCases: TestCase[] = plannedTestCases.concat(randomTestCases);

describe("Arithmetic operations", () => {

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

  it("square root", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      if (!x.isNegative) {
        const result = x.sqrt().toFixed(30);
        const expected = BigNumber.fromString(testCase.sqrtX).toFixed(30);
        expect(result).toStrictEqual(expected);
      }
      const y = BigNumber.fromString(testCase.y);
      if (!y.isNegative) {
        const result = y.sqrt().toFixed(30);
        const expected = BigNumber.fromString(testCase.sqrtY).toFixed(30);
        expect(result).toStrictEqual(expected);
      }
    }
  });

  it("square", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      // square
      const squared = x.square().toFixed(30);
      const expectedSquare = BigNumber.fromString(testCase.xSquare).toFixed(30);
      expect(squared).toStrictEqual(expectedSquare);
    }
  });

  it("pow", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCase: TestCase = testCases[i];
      const x = BigNumber.fromString(testCase.x);
      // square
      const squared = x.pow(2).toFixed(30);
      const expectedSquare = BigNumber.fromString(testCase.xSquare).toFixed(30);
      expect(squared).toStrictEqual(expectedSquare);
      // cube
      const cubed = x.pow(3).toFixed(30);
      const expectedCube = BigNumber.fromString(testCase.xCube).toFixed(30);
      expect(cubed).toStrictEqual(expectedCube);
    }
  });

});
