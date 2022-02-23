import { Big } from "as-big";
import { benchmarkCases } from "../__tests__/testUtils/benchmarkCases";
import { BenchmarkCase } from "../__tests__/testUtils/TestCase";

class XY {
  x: string;
  y: string;
}

const testCases: XY[] = benchmarkCases.map<XY>((benchCase: BenchmarkCase) => ({
  x: benchCase.x,
  y: benchCase.y,
}));

describe("fromString: as-big", () => {

  it("constructs from string", () => {
    for (let i = 0; i < 1000; i++) {
      const testCase: XY = testCases[i % testCases.length];
      Big.of(testCase.x);
      Big.of(testCase.y);
    }
  });

});
