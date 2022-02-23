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

describe("toString: as-big", () => {

  it("outputs to string", () => {
    for (let i = 0; i < 10000; i++) {
      const testCase: XY = testCases[i % testCases.length];
      testCase.x.toString();
      testCase.y.toString();
    }
  });

});
