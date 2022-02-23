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

describe("sub: as-bignumber", () => {

  it("subtracts", () => {
    for (let i = 0; i < 10000; i++) {
      const testCase: XY = testCases[i % testCases.length];
      const x = testCase.x;
      const y = testCase.y;
      x.sub(y);
    }
  });

});
