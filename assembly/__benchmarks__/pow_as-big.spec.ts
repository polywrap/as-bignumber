import { Big } from "as-big";
import { BenchmarkCase } from "../__tests__/testUtils/TestCase";
import { benchmarkCases } from "../__tests__/testUtils/benchmarkCases";

class XY {
  x: Big;
  y: Big;
}

const testCases: XY[] = benchmarkCases.map<XY>((benchCase: BenchmarkCase) => ({
  x: Big.of(benchCase.x),
  y: Big.of(benchCase.y),
}));

describe("pow: as-big", () => {

  it("exponentiates", () => {
    for (let i = 0; i < 1000; i++) {
      const testCase: XY = testCases[i % testCases.length];
      const x = testCase.x;
      const y = testCase.y;
      x.pow(5);
      y.pow(6);
    }
  });

});
