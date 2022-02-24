import {BigNumber, Rounding} from "../BigNumber";
import {BigInt} from "as-bigint";

describe("toString", () => {

  it("Accepts string input and outputs to string", () => {
    // simple decimal numbers
    let arr: string[] = [
      "1234.42",
      "-1234.42",
      "3259235823280734598273407234235353125134634513523513451235325.23423134857923498679843276987436246436346436436363463445353454",
      "-3259235823280734598273407234235353125134634513523513451235325.23423134857923498679843276987436246436346436436363463445353454",
      "0.1234",
      "-0.1234",
    ]
    for (let i = 0; i < arr.length; i++) {
      const str: string = arr[i];
      const bn: BigNumber = BigNumber.fromString(str);
      expect(bn.toString()).toStrictEqual(str);
    }

    // atypical decimal number representations
    expect(BigNumber.fromString(".1234").toString()).toStrictEqual("0.1234");
    expect(BigNumber.fromString("-.1234").toString()).toStrictEqual("-0.1234");
    expect(BigNumber.fromString("+1234.42").toString()).toStrictEqual("1234.42");

    // integer numbers
    expect(BigNumber.fromString("1234.0").toString()).toStrictEqual("1234");
    expect(BigNumber.fromString("1234.",).toString()).toStrictEqual("1234");
    expect(BigNumber.fromString("1234",).toString()).toStrictEqual("1234");
    expect(BigNumber.fromString("-1234.0").toString()).toStrictEqual("-1234");
    expect(BigNumber.fromString("-1234.",).toString()).toStrictEqual("-1234");
    expect(BigNumber.fromString("-1234",).toString()).toStrictEqual("-1234");
  });

  it("Accepts input strings in E notation", () => {
    // positive nubmers with E notation
    expect(BigNumber.fromString("1234E5").toString()).toStrictEqual("123400000");
    expect(BigNumber.fromString("1234.42E5").toString()).toStrictEqual("123442000");
    expect(BigNumber.fromString("1234E-5").toString()).toStrictEqual("0.01234");
    expect(BigNumber.fromString("1234.42E-5").toString()).toStrictEqual("0.0123442");

    // negative nubmers with E notation
    expect(BigNumber.fromString("-1234E5").toString()).toStrictEqual("-123400000");
    expect(BigNumber.fromString("-1234.42E5").toString()).toStrictEqual("-123442000");
    expect(BigNumber.fromString("-1234E-5").toString()).toStrictEqual("-0.01234");
    expect(BigNumber.fromString("-1234.42E-5").toString()).toStrictEqual("-0.0123442");
  });

  it("Accepts input strings with leading or trailing zeros", () => {
    // positive numbers
    expect(BigNumber.fromString("0001234.42").toString()).toStrictEqual("1234.42");
    expect(BigNumber.fromString("00.1234").toString()).toStrictEqual("0.1234");
    expect(BigNumber.fromString("00000123400000").toString()).toStrictEqual("123400000");
    expect(BigNumber.fromString("00.123400").toString()).toStrictEqual("0.1234");
    // negative numbers
    expect(BigNumber.fromString("-0001234.42").toString()).toStrictEqual("-1234.42");
    expect(BigNumber.fromString("-00.1234").toString()).toStrictEqual("-0.1234");
    expect(BigNumber.fromString("-00000123400000").toString()).toStrictEqual("-123400000");
    expect(BigNumber.fromString("-00.123400").toString()).toStrictEqual("-0.1234");
  });

  it("Throws on multiple decimal points", () => {
    const throws = (): void => {
      BigNumber.fromString("123.45.6");
    }
    expect(throws).toThrow("Input string contains more than one decimal point.");
  });

  it("Throws on unexpected character", () => {
    const throws = (): void => {
      BigNumber.fromString("12A3");
    }
    expect(throws).toThrow("Input string contains a value that is not a digit, decimal point, or \"e\" notation exponential mark.");
  });
});

describe("toFixed", () => {

  it("Prints output with fixed precision Rounding.UP", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.UP)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.UP)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.UP)).toStrictEqual("1234.012345679");
    expect(bn.toFixed(4, Rounding.UP)).toStrictEqual("1234.0124");
    expect(bn.toFixed(0, Rounding.UP)).toStrictEqual("1235");
    expect(bn.toFixed(-1, Rounding.UP)).toStrictEqual("124");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.UP)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.UP)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.UP)).toStrictEqual("-1234.012345679");
    expect(bnNeg.toFixed(4, Rounding.UP)).toStrictEqual("-1234.0124");
    expect(bnNeg.toFixed(0, Rounding.UP)).toStrictEqual("-1235");
    expect(bnNeg.toFixed(-1, Rounding.UP)).toStrictEqual("-124");
  });

  it("Prints output with fixed precision Rounding.DOWN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.DOWN)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.DOWN)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.DOWN)).toStrictEqual("1234.012345678");
    expect(bn.toFixed(4, Rounding.DOWN)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.DOWN)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.DOWN)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.DOWN)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.DOWN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.DOWN)).toStrictEqual("-1234.012345678");
    expect(bnNeg.toFixed(4, Rounding.DOWN)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.DOWN)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.DOWN)).toStrictEqual("-123");
  });

  it("Prints output with fixed precision Rounding.CEIL", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.CEIL)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.CEIL)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.CEIL)).toStrictEqual("1234.012345679");
    expect(bn.toFixed(4, Rounding.CEIL)).toStrictEqual("1234.0124");
    expect(bn.toFixed(0, Rounding.CEIL)).toStrictEqual("1235");
    expect(bn.toFixed(-1, Rounding.CEIL)).toStrictEqual("124");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.CEIL)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.CEIL)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.CEIL)).toStrictEqual("-1234.012345678");
    expect(bnNeg.toFixed(4, Rounding.CEIL)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.CEIL)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.CEIL)).toStrictEqual("-123");
  });

  it("Prints output with fixed precision Rounding.FLOOR", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.FLOOR)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.FLOOR)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.FLOOR)).toStrictEqual("1234.012345678");
    expect(bn.toFixed(4, Rounding.FLOOR)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.FLOOR)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.FLOOR)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.FLOOR)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.FLOOR)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.FLOOR)).toStrictEqual("-1234.012345679");
    expect(bnNeg.toFixed(4, Rounding.FLOOR)).toStrictEqual("-1234.0124");
    expect(bnNeg.toFixed(0, Rounding.FLOOR)).toStrictEqual("-1235");
    expect(bnNeg.toFixed(-1, Rounding.FLOOR)).toStrictEqual("-124");
  });

  it("Prints output with fixed precision Rounding.HALF_UP", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.HALF_UP)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.HALF_UP)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.HALF_UP)).toStrictEqual("1234.012345679");
    expect(bn.toFixed(4, Rounding.HALF_UP)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.HALF_UP)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.HALF_UP)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.HALF_UP)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.HALF_UP)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.HALF_UP)).toStrictEqual("-1234.012345679");
    expect(bnNeg.toFixed(4, Rounding.HALF_UP)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.HALF_UP)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.HALF_UP)).toStrictEqual("-123");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toFixed(5, Rounding.HALF_UP)).toStrictEqual("1234.01235");
  });

  it("Prints output with fixed precision Rounding.HALF_DOWN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.HALF_DOWN)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.HALF_DOWN)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.HALF_DOWN)).toStrictEqual("1234.012345679");
    expect(bn.toFixed(4, Rounding.HALF_DOWN)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.HALF_DOWN)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.HALF_DOWN)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.HALF_DOWN)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.HALF_DOWN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.HALF_DOWN)).toStrictEqual("-1234.012345679");
    expect(bnNeg.toFixed(4, Rounding.HALF_DOWN)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.HALF_DOWN)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.HALF_DOWN)).toStrictEqual("-123");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toFixed(5, Rounding.HALF_DOWN)).toStrictEqual("1234.01234");
  });

  it("Prints output with fixed precision Rounding.HALF_EVEN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.HALF_EVEN)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.HALF_EVEN)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.HALF_EVEN)).toStrictEqual("1234.012345679");
    expect(bn.toFixed(4, Rounding.HALF_EVEN)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.HALF_EVEN)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.HALF_EVEN)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.HALF_EVEN)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.HALF_EVEN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.HALF_EVEN)).toStrictEqual("-1234.012345679");
    expect(bnNeg.toFixed(4, Rounding.HALF_EVEN)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.HALF_EVEN)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.HALF_EVEN)).toStrictEqual("-123");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toFixed(5, Rounding.HALF_EVEN)).toStrictEqual("1234.01234");
    const strHalfOdd: string = "1234.012335";
    const bnHalfOdd: BigNumber = BigNumber.fromString(strHalfOdd);
    expect(bnHalfOdd.toFixed(5, Rounding.HALF_EVEN)).toStrictEqual("1234.01234");
  });

  it("Prints output with fixed precision Rounding.NONE", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(18, Rounding.NONE)).toStrictEqual("1234.012345678900000000");
    expect(bn.toFixed(10, Rounding.NONE)).toStrictEqual("1234.0123456789");
    expect(bn.toFixed(9, Rounding.NONE)).toStrictEqual("1234.012345678");
    expect(bn.toFixed(4, Rounding.NONE)).toStrictEqual("1234.0123");
    expect(bn.toFixed(0, Rounding.NONE)).toStrictEqual("1234");
    expect(bn.toFixed(-1, Rounding.NONE)).toStrictEqual("123");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toFixed(18, Rounding.NONE)).toStrictEqual("-1234.012345678900000000");
    expect(bnNeg.toFixed(10, Rounding.NONE)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toFixed(9, Rounding.NONE)).toStrictEqual("-1234.012345678");
    expect(bnNeg.toFixed(4, Rounding.NONE)).toStrictEqual("-1234.0123");
    expect(bnNeg.toFixed(0, Rounding.NONE)).toStrictEqual("-1234");
    expect(bnNeg.toFixed(-1, Rounding.NONE)).toStrictEqual("-123");
  });

  it("Prints output with fixed precision when rounding adds a zero", () => {
    const str: string = "1234.012345678901";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(10, Rounding.UP)).toStrictEqual("1234.0123456790");
  });

  it("Prints output with fixed precision when requested places eliminates string", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toFixed(-5, Rounding.UP)).toStrictEqual("0");
    expect(bn.toFixed(-4, Rounding.UP)).toStrictEqual("0");
  });
});


describe("toSignificant", () => {

  it("Prints output with significant digits Rounding.UP", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.UP)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.UP)).toStrictEqual("1234.012346");
    expect(bn.toSignificant(9, Rounding.UP)).toStrictEqual("1234.01235");
    expect(bn.toSignificant(4, Rounding.UP)).toStrictEqual("1235");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.UP)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.UP)).toStrictEqual("-1234.012346");
    expect(bnNeg.toSignificant(9, Rounding.UP)).toStrictEqual("-1234.01235");
    expect(bnNeg.toSignificant(4, Rounding.UP)).toStrictEqual("-1235");
  });

  it("Prints output with significant digits Rounding.DOWN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.DOWN)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.DOWN)).toStrictEqual("1234.012345");
    expect(bn.toSignificant(9, Rounding.DOWN)).toStrictEqual("1234.01234");
    expect(bn.toSignificant(4, Rounding.DOWN)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.DOWN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.DOWN)).toStrictEqual("-1234.012345");
    expect(bnNeg.toSignificant(9, Rounding.DOWN)).toStrictEqual("-1234.01234");
    expect(bnNeg.toSignificant(4, Rounding.DOWN)).toStrictEqual("-1234");
  });

  it("Prints output with significant digits Rounding.CEIL", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.CEIL)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.CEIL)).toStrictEqual("1234.012346");
    expect(bn.toSignificant(9, Rounding.CEIL)).toStrictEqual("1234.01235");
    expect(bn.toSignificant(4, Rounding.CEIL)).toStrictEqual("1235");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.CEIL)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.CEIL)).toStrictEqual("-1234.012345");
    expect(bnNeg.toSignificant(9, Rounding.CEIL)).toStrictEqual("-1234.01234");
    expect(bnNeg.toSignificant(4, Rounding.CEIL)).toStrictEqual("-1234");
  });

  it("Prints output with significant digits Rounding.FLOOR", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.FLOOR)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.FLOOR)).toStrictEqual("1234.012345");
    expect(bn.toSignificant(9, Rounding.FLOOR)).toStrictEqual("1234.01234");
    expect(bn.toSignificant(4, Rounding.FLOOR)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.FLOOR)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.FLOOR)).toStrictEqual("-1234.012346");
    expect(bnNeg.toSignificant(9, Rounding.FLOOR)).toStrictEqual("-1234.01235");
    expect(bnNeg.toSignificant(4, Rounding.FLOOR)).toStrictEqual("-1235");
  });

  it("Prints output with significant digits Rounding.HALF_UP", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.HALF_UP)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.HALF_UP)).toStrictEqual("1234.012346");
    expect(bn.toSignificant(9, Rounding.HALF_UP)).toStrictEqual("1234.01235");
    expect(bn.toSignificant(4, Rounding.HALF_UP)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.HALF_UP)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.HALF_UP)).toStrictEqual("-1234.012346");
    expect(bnNeg.toSignificant(9, Rounding.HALF_UP)).toStrictEqual("-1234.01235");
    expect(bnNeg.toSignificant(4, Rounding.HALF_UP)).toStrictEqual("-1234");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toSignificant(9, Rounding.HALF_UP)).toStrictEqual("1234.01235");
  });

  it("Prints output with significant digits Rounding.HALF_DOWN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.HALF_DOWN)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.HALF_DOWN)).toStrictEqual("1234.012346");
    expect(bn.toSignificant(9, Rounding.HALF_DOWN)).toStrictEqual("1234.01235");
    expect(bn.toSignificant(4, Rounding.HALF_DOWN)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.HALF_DOWN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.HALF_DOWN)).toStrictEqual("-1234.012346");
    expect(bnNeg.toSignificant(9, Rounding.HALF_DOWN)).toStrictEqual("-1234.01235");
    expect(bnNeg.toSignificant(4, Rounding.HALF_DOWN)).toStrictEqual("-1234");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toSignificant(9, Rounding.HALF_DOWN)).toStrictEqual("1234.01234");
  });

  it("Prints output with significant digits Rounding.HALF_EVEN", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.HALF_EVEN)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.HALF_EVEN)).toStrictEqual("1234.012346");
    expect(bn.toSignificant(9, Rounding.HALF_EVEN)).toStrictEqual("1234.01235");
    expect(bn.toSignificant(4, Rounding.HALF_EVEN)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.HALF_EVEN)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.HALF_EVEN)).toStrictEqual("-1234.012346");
    expect(bnNeg.toSignificant(9, Rounding.HALF_EVEN)).toStrictEqual("-1234.01235");
    expect(bnNeg.toSignificant(4, Rounding.HALF_EVEN)).toStrictEqual("-1234");

    const strHalf: string = "1234.012345";
    const bnHalf: BigNumber = BigNumber.fromString(strHalf);
    expect(bnHalf.toSignificant(9, Rounding.HALF_EVEN)).toStrictEqual("1234.01234");
    const strHalfOdd: string = "1234.012335";
    const bnHalfOdd: BigNumber = BigNumber.fromString(strHalfOdd);
    expect(bnHalfOdd.toSignificant(9, Rounding.HALF_EVEN)).toStrictEqual("1234.01234");
  });

  it("Prints output with significant digits Rounding.NONE", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(18, Rounding.NONE)).toStrictEqual("1234.0123456789");
    expect(bn.toSignificant(10, Rounding.NONE)).toStrictEqual("1234.012345");
    expect(bn.toSignificant(9, Rounding.NONE)).toStrictEqual("1234.01234");
    expect(bn.toSignificant(4, Rounding.NONE)).toStrictEqual("1234");

    const strNeg: string = "-1234.0123456789";
    const bnNeg: BigNumber = BigNumber.fromString(strNeg);
    expect(bnNeg.toSignificant(18, Rounding.NONE)).toStrictEqual("-1234.0123456789");
    expect(bnNeg.toSignificant(10, Rounding.NONE)).toStrictEqual("-1234.012345");
    expect(bnNeg.toSignificant(9, Rounding.NONE)).toStrictEqual("-1234.01234");
    expect(bnNeg.toSignificant(4, Rounding.NONE)).toStrictEqual("-1234");
  });

  it("Prints output with significant digits when rounding would add a zero", () => {
    const str: string = "1234.01234567891";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(14, Rounding.UP)).toStrictEqual("1234.012345679");
  });

  it("Prints output with significant digits when requested digits is zero or negative", () => {
    const str: string = "1234.0123456789";
    const bn: BigNumber = BigNumber.fromString(str);
    expect(bn.toSignificant(0, Rounding.UP)).toStrictEqual("0");
    expect(bn.toSignificant(-1, Rounding.UP)).toStrictEqual("0");
  });
});

describe("fromFraction", () => {

  it("Handles sign", () => {
    let numerator = BigInt.fromString("123456789");
    let denominator = BigInt.fromString("1234567890");
    let numeratorNeg = BigInt.fromString("-123456789");
    let denominatorNeg = BigInt.fromString("-1234567890");

    let bn0 = BigNumber.fromFraction(numerator, denominator);
    expect(bn0.toString()).toStrictEqual("0.1");

    let bn1 = BigNumber.fromFraction(numeratorNeg, denominator);
    expect(bn1.toString()).toStrictEqual("-0.1");

    let bn2 = BigNumber.fromFraction(numeratorNeg, denominatorNeg);
    expect(bn2.toString()).toStrictEqual("0.1");

    let bn3 = BigNumber.fromFraction(numerator, denominatorNeg);
    expect(bn3.toString()).toStrictEqual("-0.1");
  });

  it("Handles irrational numbers", () => {
    let numerator = BigInt.fromString("1");
    let denominator = BigInt.fromString("3");

    let bnDOWN = BigNumber.fromFraction(numerator, denominator, 5, Rounding.DOWN);
    expect(bnDOWN.toString()).toStrictEqual("0.33333");

    let bnUP = BigNumber.fromFraction(numerator, denominator, 5, Rounding.UP);
    expect(bnUP.toString()).toStrictEqual("0.33334");
  });

  it("Handles zero numerator", () => {
    let numerator = BigInt.fromString("0");
    let denominator = BigInt.fromString("1234567890");
    let bn = BigNumber.fromFraction(numerator, denominator);
    expect(bn.toString()).toStrictEqual("0");
  });

  it("Throws on zero denominator", () => {
    const throws = (): void => {
      let numerator = BigInt.fromString("123456789");
      let denominator = BigInt.fromString("0");
      BigNumber.fromFraction(numerator, denominator);
    }
    expect(throws).toThrow("Divide by zero");
  });
});

describe("toBigInt", () => {
  it("returns BigInt as floor of decimal value", () => {
    let dec = BigNumber.fromString("123456789.1234");
    expect(dec.toBigInt().toString()).toStrictEqual("123456789");

    dec = BigNumber.fromString("-123456789.1234");
    expect(dec.toBigInt().toString()).toStrictEqual("-123456789");

    dec = BigNumber.fromString("123456789.9876");
    expect(dec.toBigInt().toString()).toStrictEqual("123456789");

    dec = BigNumber.fromString("-123456789.9876");
    expect(dec.toBigInt().toString()).toStrictEqual("-123456789");

    dec = BigNumber.fromString("0.1234");
    expect(dec.toBigInt().toString()).toStrictEqual("0");

    dec = BigNumber.fromString("-0.1234");
    expect(dec.toBigInt().toString()).toStrictEqual("0");

    dec = BigNumber.fromString("0.9876");
    expect(dec.toBigInt().toString()).toStrictEqual("0");

    dec = BigNumber.fromString("-0.9876");
    expect(dec.toBigInt().toString()).toStrictEqual("0");
  });
});

describe("toFloat64", () => {
  it("returns f64", () => {
    const dec0 = BigNumber.fromString("123456789.1234");
    expect(dec0.toFloat64()).toStrictEqual(123456789.1234);

    const dec1 = BigNumber.fromString("0.1234");
    expect(dec1.toFloat64()).toStrictEqual(0.1234);

    const dec2 = BigNumber.fromString("123456789.9876");
    expect(dec2.toFloat64()).toStrictEqual(123456789.9876);

    const dec3 = BigNumber.fromString("-0.9876");
    expect(dec3.toFloat64()).toStrictEqual(-0.9876);

    const dec4 = BigNumber.fromString("1.8e308");
    expect(dec4.toFloat64()).toStrictEqual(Infinity);
  });
});
