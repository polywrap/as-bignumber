import { BigNumber } from "../BigNumber";
import { BenchmarkCase } from "../__tests__/testUtils/TestCase";
import { benchmarkCases } from "../__tests__/testUtils/benchmarkCases";

class XY {
  x: BigNumber;
  y: BigNumber;
}

const testCases: XY[] = benchmarkCases.map<XY>((benchCase: BenchmarkCase) => ({
  x: BigNumber.from(benchCase.x),
  y: BigNumber.from(benchCase.y),
}));

describe("toString: as-bignumber", () => {

  it("outputs to string", () => {
    for (let i = 0; i < 10000; i++) {
      const testCase: XY = testCases[i % testCases.length];
      testCase.x.toString();
      testCase.y.toString();
    }
  });

});
