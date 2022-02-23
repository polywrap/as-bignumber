import { Big } from "as-big";
import { BenchmarkCase } from "../__tests__/testUtils/TestCase";
import { benchmarkCases } from "../__tests__/testUtils/benchmarkCases";

class XY {
  x: Big;
  y: Big;
}

const testCases: XY[] = benchmarkCases.map<XY>((benchCase: BenchmarkCase) => ({
  x: Big.of(benchCase.x).abs(),
  y: Big.of(benchCase.y).abs(),
}));

describe("sqrt: as-big", () => {

  it("square root", () => {
    for (let i = 0; i < 100; i++) {
      const testCase: XY = testCases[i % testCases.length];
      testCase.x.sqrt();
      testCase.y.sqrt();
    }
  });

});
