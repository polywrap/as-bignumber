import { BigNumber } from "../BigNumber";
import { BenchmarkCase } from "../__tests__/testUtils/TestCase";
import { benchmarkCases } from "../__tests__/testUtils/benchmarkCases";

class XY {
  x: BigNumber;
  y: BigNumber;
}

const testCases: XY[] = benchmarkCases.map<XY>((benchCase: BenchmarkCase) => ({
  x: BigNumber.from(benchCase.x).abs(),
  y: BigNumber.from(benchCase.y).abs(),
}));

describe("sqrt: as-bignumber", () => {

  it("square root", () => {
    for (let i = 0; i < 100; i++) {
      const testCase: XY = testCases[i % testCases.length];
      const x = testCase.x;
      const y = testCase.y;
      x.sqrt();
      y.sqrt();
    }
  });

});
