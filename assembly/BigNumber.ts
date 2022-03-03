import { BigInt } from "as-bigint";

export enum Rounding {
  UP, // Rounding mode to round away from zero.
  DOWN, // Rounding mode to round towards zero.
  CEIL, // Rounding mode to round towards positive infinity.
  FLOOR, // Rounding mode to round towards negative infinity.
  HALF_UP, // Rounding mode to round towards "nearest neighbor" unless both neighbors are equidistant, in which case round up.
  HALF_DOWN, // Rounding mode to round towards "nearest neighbor" unless both neighbors are equidistant, in which case round down.
  HALF_EVEN, // Rounding mode to round towards the "nearest neighbor" unless both neighbors are equidistant, in which case, round towards the even neighbor.
  NONE, // Rounding mode to assert that the requested operation has an exact result, hence no rounding is necessary.
}

// Multiple precision decimal number
export class BigNumber {

  // Mantissa; A BigNumber takes the form m * 10^-e
  public readonly m: BigInt;
  // Scale; A BigNumber takes the form m * 10^-e
  public readonly e: i32;
  // Limits the length of the mantissa
  private _precision: i32;
  get precision(): i32 {
    if (this._precision <= 0) {
      this._precision = BigNumber.intLength(this.m);
    }
    return this._precision;
  }
  // returns true if this BigNumber has an integer value
  private _isInteger: i32 = -1;
  get isInteger(): boolean {
    if (this._isInteger < 0) {
      const trimmed: BigNumber = BigNumber.trimZeros(this.m, this.e, I32.MIN_VALUE);
      this._isInteger = trimmed.e <= 0 ? 1 : 0;
    }
    return this._isInteger == 1;
  }

  // 155, the number of digits in the maximum value of a 512 bit integer
  public static DEFAULT_PRECISION: i32 = 155;
  public static DEFAULT_ROUNDING: Rounding = Rounding.HALF_UP;
  public static readonly MAX_POWER: i32 = 999999999;

  public static readonly ONE: BigNumber = new BigNumber(BigInt.ONE, 0, 0);
  public static readonly HALF: BigNumber = new BigNumber(BigInt.fromUInt16(5), 1, 0);

  private static readonly TEN_POWERS: u32[] = [
    1,                     // 0 / 10^0
    10,                    // 1 / 10^1
    100,                   // 2 / 10^2
    1000,                  // 3 / 10^3
    10000,                 // 4 / 10^4
    100000,                // 5 / 10^5
    1000000,               // 6 / 10^6
    10000000,              // 7 / 10^7
    100000000,             // 8 / 10^8
    1000000000,             // 9 / 10^9
  ];
  private static readonly BI_TEN_POWERS: BigInt[] = [
    BigInt.ONE,
    BigInt.fromUInt16(10),
    BigInt.fromUInt16(100),
    BigInt.fromUInt16(1000),
    BigInt.fromUInt16(10000), // 4 / 10^4
    BigInt.fromUInt32(100000),
    BigInt.fromUInt32(1000000),
    BigInt.fromUInt32(10000000),
    BigInt.fromUInt32(100000000),
    BigInt.fromUInt32(1000000000), // 9 / 10^9
  ];
  private static readonly BI_TEN_POWERS_MAX: i32 = 16 * BigNumber.BI_TEN_POWERS.length;

  // CONSTRUCTORS //////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(m: BigInt, e: i32, precision: i32) {
    this.m = m;
    this.e = e;
    this._precision = precision;
  }

  // generic constructor based on https://github.com/ttulka/as-big/blob/main/assembly/Big.ts#L84
  /**
   * Returns a new {BigNumber} instance from generic type {T}.
   *
   * @param  val the number as {BigNumber}, {BigInt}, {string}, or {number}
   * @return BigNumber the new {BigNumber} instance
   */
  static from<T>(val: T): BigNumber {
    if (val instanceof BigNumber) return val;
    // @ts-ignore
    if (val instanceof string) return BigNumber.fromString(val);
    // @ts-ignore
    if (val instanceof BigInt) return new BigNumber(val, 0, 0);
    // @ts-ignore
    if (val instanceof f32) return BigNumber.fromFloat64(<f64>val);
    // @ts-ignore
    if (val instanceof f64) return BigNumber.fromFloat64(val);
    // @ts-ignore
    if (val instanceof i8) return new BigNumber(BigInt.fromInt16(<i16>val), 0, 0);
    // @ts-ignore
    if (val instanceof u8) return new BigNumber(BigInt.fromUInt16(<u16>val), 0, 0);
    // @ts-ignore
    if (val instanceof i16) return new BigNumber(BigInt.fromInt16(val), 0, 0);
    // @ts-ignore
    if (val instanceof u16) return new BigNumber(BigInt.fromUInt16(val), 0, 0);
    // @ts-ignore
    if (val instanceof i32) return new BigNumber(BigInt.fromInt32(val), 0, 0);
    // @ts-ignore
    if (val instanceof u32) return new BigNumber(BigInt.fromUInt32(val), 0, 0);
    // @ts-ignore
    if (val instanceof i64) return new BigNumber(BigInt.fromInt64(val), 0, 0);
    // @ts-ignore
    if (val instanceof u64) return new BigNumber(BigInt.fromUInt64(val), 0, 0);

    throw new TypeError("Unsupported generic type " + nameof<T>(val));
  }

  static fromFraction(numerator: BigInt, denominator: BigInt, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const floatNumerator = new BigNumber(numerator, 0, 0);
    const floatDenominator = new BigNumber(denominator, 0, 0);
    return floatNumerator.div(floatDenominator, precision, rounding);
  }

  /**
   * Constructs and returns BigNumber from decimal string
   * @param val A decimal string, e.g. "5.5", "5", "5E10"
   * @param precision
   * @param rounding
   */
  static fromString(val: string, precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    // big number values
    let mantissa: BigInt; // mantissa
    let exponent: i32 = 0; // exponent
    let p: i32 = 0; // precision

    // values for parsing string
    let offset: i32 = 0;
    let len: i32 = val.length;

    // handle the sign
    let isNeg: boolean = false;
    if (val.charAt(offset) == '-') {
      isNeg = true;
      offset++;
      len--;
    } else if (val.charAt(offset) == '+') { // leading + allowed
      offset++;
      len--;
    }

    let dot: boolean = false; // decimal point
    let idx: i32 = 0;
    let codes: i32[] = [];
    for (; len > 0; offset++, len--) {
      const char: i32 = val.charCodeAt(offset);

      // char is digit
      if (char >= 48 && char <= 57) {
        // char is 0
        if (char == 48) {
          // char is first leading zero
          if (p == 0) {
            codes[idx] = char;
            p = 1;
            // char is a zero that follows another digit
          } else if (idx != 0) {
            codes[idx++] = char;
            ++p;
          }
          // char is non-zero digit
        } else {
          // increment precision if char is not redundant leading zero
          if (p != 1 || idx != 0) {
            ++p;
          }
          codes[idx++] = char;
        }
        if (dot) {
          ++exponent;
        }
        continue;
      }

      // char is decimal point
      if (char == 46) {
        if (dot) {
          throw new Error("Input string contains more than one decimal point.");
        }
        dot = true;
        continue;
      }

      // exponential notation mark expected
      if (char != 69 && char != 101) {
        throw new Error("Input string contains a character that is not a digit, decimal point, or \"e\" notation exponential mark.");
      }
      const eMark: i64 = BigNumber.parseExp(val, offset, len);
      if (eMark != 0) {
        exponent = BigNumber.overflowGuard(<i64>exponent - eMark);
      }
      break;
    }

    // Check if digits
    if (p == 0) {
      throw new Error("No digits found.");
    }

    mantissa = BigInt.fromString((isNeg ? "-" : "") + String.fromCharCodes(codes));
    if (mantissa.isZero()) {
      return new BigNumber(mantissa, 0, 0);
    }

    // Remove leading zeros from precision (digits count)
    if (precision > 0 && p > precision) {
      let precisionDiff: i32 = p - precision;
      while (precisionDiff > 0) {
        exponent = BigNumber.overflowGuard(<i64>exponent - precisionDiff);
        mantissa = BigNumber.divideAndRoundByPowTen(mantissa, precisionDiff, rounding);
        p = BigNumber.intLength(mantissa);
        precisionDiff = p - precision;
      }
    }

    return BigNumber.trimZeros(mantissa, exponent, I32.MIN_VALUE);
  }

  static fromBigInt(val: BigInt): BigNumber {
    return new BigNumber(val.copy(), 0, 0);
  }

  static fromFloat64(val: f64, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    return BigNumber.fromString(val.toString(), precision, rounding);
  }

  // O(N)
  copy(): BigNumber {
    return new BigNumber(this.m.copy(), this.e, this._precision);
  }

  // O(N)
  opposite(): BigNumber  {
    return new BigNumber(this.m.opposite(), this.e, this._precision);
  }

  // O(N)
  abs(): BigNumber  {
    return new BigNumber(this.m.abs(), this.e, this._precision);
  }

  reciprocal(precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    return BigNumber.ONE.div(this, precision, rounding);
  }

  // OUTPUT ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  toString(): string {
    const trimmed: BigNumber = BigNumber.trimZeros(this.m, this.e, I32.MIN_VALUE);
    if (trimmed.e == 0) {
      return trimmed.m.toString();
    }
    // integer number
    if (trimmed.e < 0) {
      if (trimmed.m.isZero()) {
        return "0";
      }
      const mString: string = trimmed.m.toString();
      return mString.padEnd(mString.length - trimmed.e, "0");
    }
    // decimal number
    const neg: boolean = trimmed.m.isNegative;
    const mStr: string = (neg ? trimmed.m.abs() : trimmed.m).toString();
    const i: i32 = mStr.length - trimmed.e; // decimal point index related to mString
    if (i == 0) {
      return (neg ? "-0." : "0.") + mStr;
    } else if (i > 0) {
      return (neg ? "-" : "") + mStr.substring(0, i) + "." + mStr.substring(i);
    } else {
      const preM: string = neg ? "-0." : "0.";
      return preM.padEnd(preM.length - i, "0") + mStr;
    }
  }

  toFixed(places: i32 = 18, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): string {
    if (this.e > this.precision) {
      const round: Rounding = rounding == Rounding.NONE ? Rounding.DOWN : rounding;
      return this.roundToPlaces(places, round).toString();
    }

    const round: Rounding = rounding == Rounding.NONE ? Rounding.DOWN : rounding;
    const trimmed: BigNumber = BigNumber.trimZeros(this.m, this.e, I32.MIN_VALUE);
    const res: BigNumber = trimmed.roundToPlaces(places, round);
    const resStr: string = res.toString();

    // calculate result length
    const intLength: i64 = <i64>trimmed.precision - trimmed.e;
    const precision: i32 = BigNumber.overflowGuard(intLength + places);
    // negative precision corresponds to empty string
    if (precision <= 0) {
      return "0";
    }

    // decimal number results may need padded zeros
    if (places > 0) {
      if (trimmed.e <= 0) {
        // integer number returned in decimal form
        return resStr + ".".padEnd(1 + places, "0");
      } else {
        // decimal number returned in decimal form
        return resStr.padEnd(precision + 1 + res.isNegative, "0");
      }
    } else {
      // number returned in integer form -> may need trimming
      return resStr.substring(0, precision + res.isNegative);
    }
  }

  toSignificant(digits: i32 = 18, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): string {
    if (digits <= 0) {
      return "0";
    }
    const round: Rounding = rounding == Rounding.NONE ? Rounding.DOWN : rounding;
    return this.round(digits, round).toString();
  }

  toBigInt(): BigInt {
    if (this.isInteger) {
      return this.m.copy();
    }
    return this.roundToPlaces(0, Rounding.DOWN).m.copy();
  }

  toFloat64(): f64 {
    return F64.parseFloat(this.toString());
  }

  // COMPARISON OPERATORS //////////////////////////////////////////////////////////////////////////////////////////////

  eq<T>(other: T): boolean {
    return this.compareTo(BigNumber.from(other)) == 0;
  }

  ne<T>(other: T): boolean {
    return !this.eq(BigNumber.from(other));
  }

  lt<T>(other: T): boolean {
    return this.compareTo(BigNumber.from(other)) < 0;
  }

  lte<T>(other: T): boolean {
    return this.compareTo(BigNumber.from(other)) <= 0;
  }

  gt<T>(other: T): boolean {
    return this.compareTo(BigNumber.from(other)) > 0;
  }

  gte<T>(other: T): boolean {
    return this.compareTo(BigNumber.from(other)) >= 0;
  }

  compareTo(other: BigNumber): i32 {
    // opposite signs
    if (this.isNegative && !other.isNegative) {
      return -1;
    } else if (!this.isNegative && other.isNegative) {
      return 1;
    } else if (this.isNegative) {
      return other.magCompareTo(this);
    } else {
      return this.magCompareTo(other);
    }
  }

  magCompareTo(other: BigNumber): i32 {
    const eDiff: i64 = <i64>this.e - other.e;
    if (eDiff == 0) {
      return this.m.magCompareTo(other.m);
    }
    // Compare lengths of integer parts of decimal numbers
    const leftIntLen: i64 = <i64>this.precision - this.e;
    const rightIntLen: i64 = <i64>other.precision - other.e;
    if (leftIntLen < rightIntLen) {
      return -1;
    }
    if (leftIntLen > rightIntLen) {
      return 1;
    }
    // rescale and compare mantissas
    let left: BigInt = this.m;
    let right: BigInt = other.m;
    if (eDiff < 0 && eDiff > I32.MIN_VALUE) {
      left = BigNumber.mulPowTen(this.m, <i32>-eDiff);
    }
    if (eDiff > 0 && eDiff <= I32.MAX_VALUE) {
      right = BigNumber.mulPowTen(other.m, <i32>eDiff);
    }
    return left.magCompareTo(right);
  }

  // ARITHMETIC ////////////////////////////////////////////////////////////////////////////////////////////////////////

  add<T>(other: T, precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    let addend = BigNumber.from(other);
    let left: BigInt = this.m;
    let right: BigInt = addend.m;
    let exponent: i32;
    if (this.e >= addend.e) {
      const rescale: i32 = BigNumber.overflowGuard(<i64>this.e - addend.e, right.isZero());
      right = BigNumber.mulPowTen(right, rescale);
      exponent = this.e;
    } else {
      const rescale: i32 = BigNumber.overflowGuard(<i64>addend.e - this.e, left.isZero());
      left = BigNumber.mulPowTen(left, rescale);
      exponent = addend.e;
    }
    return new BigNumber(left.add(right), exponent, 0).round(precision, rounding);
  }

  sub<T>(other: T, precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    return this.add(BigNumber.from(other).opposite(), precision, rounding);
  }

  mul<T>(other: T, precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const multiplier: BigNumber = BigNumber.from(other);
    const left: BigInt = this.m;
    const right: BigInt = multiplier.m;
    const m: BigInt = left.mul(right);
    const e: i32 = BigNumber.overflowGuard( <i64>this.e + multiplier.e, this.m.isZero());
    return new BigNumber(m, e, 0).round(precision, rounding);
  }

  square(precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const m: BigInt = this.m.square();
    const e: i32 = BigNumber.overflowGuard( <i64>this.e + this.e, this.m.isZero());
    return new BigNumber(m, e, 0).round(precision, rounding);
  }

  /**
   * Divides two BigNumbers and rounds result
   */
  div<T>(other: T, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const divisor: BigNumber = BigNumber.from(other);
    if (divisor.m.isZero()) {
      throw new Error("Divide by zero");
    }
    if (this.m.isZero()) {
      return new BigNumber(this.m.copy(), BigNumber.overflowGuard(this.e - divisor.e, true), this.precision);
    }
    let left: BigInt = this.m;
    let right: BigInt = divisor.m;
    const leftP: i32 = this.precision;
    let rightP: i32 = divisor.precision;
    const eDiff: i32 = BigNumber.overflowGuard(this.e - divisor.e);
    // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
    if (BigNumber.compareMagnitudeNormalized(left, leftP, right, rightP) > 0) {
      rightP -= 1;
    }
    // rescale and divide
    const e: i32 = BigNumber.overflowGuard(<i64>eDiff + rightP - leftP + precision);
    if (BigNumber.overflowGuard(<i64>precision + rightP - leftP) > 0) {
      const rescale: i32 = BigNumber.overflowGuard(<i64>precision + rightP - leftP);
      left = BigNumber.mulPowTen(left, rescale);
    } else {
      const rescale: i32 = BigNumber.overflowGuard(<i64>leftP - precision - rightP);
      right = BigNumber.mulPowTen(right, rescale);
    }
    const quotient: BigInt = BigNumber.divideAndRound(left, right, rounding);
    // clean up and round
    return BigNumber.trimZeros(quotient, e, eDiff).round(precision, rounding);
  }

  sqrt(precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    if (this.isNegative)
      throw new RangeError("Square root of negative numbers is not supported");
    if (this.isZero()) return this.copy();

    // initial estimate -> works for numbers up to 1024 digits
    let res: BigNumber = BigNumber.fromFloat64(Math.sqrt(this.toFloat64()));
    // stop condition
    let rPrec: i32 = 15;
    const targetPrec: i32 = (precision <= 0 ? this.precision / 2 + 1 : precision) + 2;

    // Newton-Raphson iteration
    do {
      // approx = 0.5 * (approx + fraction / approx)
      res = this.div(res, targetPrec, Rounding.HALF_EVEN).add(res).mul(BigNumber.HALF);
      rPrec <<= 1;
    } while (rPrec < targetPrec);

    return res.round(precision, rounding);
  }

  pow(k: i32, precision: i32 = 0, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    if (k < -BigNumber.MAX_POWER || k > BigNumber.MAX_POWER) {
      throw new Error(`Power argument out of bounds [-${BigNumber.MAX_POWER}, ${BigNumber.MAX_POWER}]: ${k}`);
    }
    const posK: boolean = k > 0;

    if (posK) {
      const m: BigInt = this.m.pow(k);
      const e: i32 = BigNumber.overflowGuard(<i64>this.e * k);
      return new BigNumber(m, e, 0).round(precision, rounding);
    }

    k = -k;
    let x: BigNumber = this;
    let res: BigNumber = BigNumber.ONE;
    while (k > 0) {
      /* if the bit is set multiply */
      if ((k & 1) != 0) res = res.mul(x);
      /* square */
      if (k > 1) x = x.square();
      /* shift to next bit */
      k >>= 1;
    }
    return BigNumber.ONE.div(res, precision, rounding);
  }

  // UTILITIES /////////////////////////////////////////////////////////////////////////////////////////////////////////

  get isNegative(): boolean {
    return this.m.isNegative;
  }

  isZero(): boolean {
    return this.m.isZero();
  }

  floor(): BigNumber {
    if (this.isInteger) {
      return this;
    }
    const rounded: BigNumber = this.roundToPlaces(0, Rounding.FLOOR);
    // this fixes a special case where rounding is not working as expected
    if (this.isNegative && this.compareTo(rounded) < 0) {
      return rounded.sub(1);
    }
    return rounded;
  }

  ceil(): BigNumber {
    if (this.isInteger) {
      return this;
    }
    const rounded: BigNumber = this.roundToPlaces(0, Rounding.CEIL);
    // this fixes a special case where rounding is not working as expected
    if (this.isNegative && !rounded.isNegative && !rounded.isZero()) {
      return rounded.sub(1);
    }
    return rounded;
  }

  static min<T, U>(x: T, y: U): BigNumber {
    const left: BigNumber = BigNumber.from(x);
    const right: BigNumber = BigNumber.from(y);
    return left.compareTo(right) <= 0 ? left : right;
  }

  static max<T, U>(x: T, y: U): BigNumber {
    const left: BigNumber = BigNumber.from(x);
    const right: BigNumber = BigNumber.from(y);
    return left.compareTo(right) >= 0 ? left : right;
  }

  setScale(e: i32, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    if (e == this.e) {
      return this;
    }
    if (this.m.isZero()) {
      return new BigNumber(this.m.copy(), e, this._precision);
    }
    if (e > this.e) {
      const rescale: i32 = BigNumber.overflowGuard(<i64>e - this.e);
      const m: BigInt = BigNumber.mulPowTen(this.m, rescale);
      const precision: i32 = this.precision > 0 ? this.precision + rescale : 0;
      return new BigNumber(m, e, precision);
    } else {
      // if new e is less than original e, the result may not be equal to the original BigNumber due to rounding
      const rescale: i32 = BigNumber.overflowGuard(<i64>this.e - e);
      const divisor: BigInt = BigNumber.tenToThe(rescale);
      const m: BigInt = BigNumber.divideAndRound(this.m, divisor, rounding);
      return new BigNumber(m, e, 0);
    }
  }

  round(precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    if (precision <= 0 || this.precision <= precision) {
      return this;
    }

    let m: BigInt = this.m;
    let e: i32 = this.e;
    let prec: i32 = this.precision;

    let pDiff: i32 = prec - precision;
    while (pDiff > 0) {
      e = BigNumber.overflowGuard(<i64>e - pDiff);
      m = BigNumber.divideAndRoundByPowTen(m, pDiff, rounding);
      prec = BigNumber.intLength(m);
      pDiff = prec - precision;
    }

    return new BigNumber(m, e, prec);
  }

  // PARSE SUPPORT /////////////////////////////////////////////////////////////

  /**
   * Parse exponent for fromString
   */
  private static parseExp(val: string, offset: i32, len: i32): i32 {
    offset++;
    let char: string = val.charAt(offset);
    len--;

    const negexp: boolean = char == '-';
    // sign
    if (negexp || char == '+') {
      offset++;
      char = val.charAt(offset);
      len--;
    }

    if (len <= 0) {
      throw new Error("No digits following exponential mark.");
    }
    // skip leading zeros in the exponent
    while (len > 10 && char == '0') {
      offset++;
      char = val.charAt(offset);
      len--;
    }
    if (len > 10) {
      throw new Error("Too many nonzero exponent digits.");
    }

    let exp: i64 = 0;
    for (;; len--) {
      const code = char.charCodeAt(0);
      if (code < 48 || code > 57) {
        throw new Error("Encountered non-digit character following exponential mark.");
      }
      exp = exp * 10 + (code - 48);
      if (len == 1) {
        break; // that was final character
      }
      char = val.charAt(++offset);
    }

    // apply sign
    if (negexp) {
      exp = -exp;
    }
    return BigNumber.overflowGuard(exp, false);
  }

  // SCALE SUPPORT /////////////////////////////////////////////////////////////

  private static overflowGuard(k: i64, isZero: boolean = false): i32 {
    let safeInt: i32 = <i32>k;
    if (<i64>safeInt != k) {
      if (!isZero) {
        throw new Error("Integer overflow");
      }
      safeInt = k > I32.MAX_VALUE ? I32.MAX_VALUE : I32.MIN_VALUE;
    }
    return safeInt;
  }

  private static mulPowTen(val: BigInt, k: i32): BigInt {
    if (k <= 0) {
      return val;
    }
    if (k < BigNumber.TEN_POWERS.length - 1) {
      return val.mulInt(BigNumber.TEN_POWERS[k]);
    }
    return val.mul(BigNumber.tenToThe(k));
  }

  /**
   * Divides value by power of ten.
   */
  private static divideAndRoundByPowTen(val: BigInt, k: i32, rounding: i32): BigInt {
    if (k < BigNumber.TEN_POWERS.length) {
      return BigNumber.divideAndRoundInt(val, BigNumber.TEN_POWERS[k], rounding);
    }
    return BigNumber.divideAndRound(val, BigNumber.tenToThe(k), rounding);
  }

  /**
   * Return 10 to the power n, as a {@code BigInteger}.
   *
   * @param  k the power of ten to be returned (>=0)
   * @return a {@code BigInteger} with the value (10<sup>n</sup>)
   */
  private static tenToThe(k: i32): BigInt {
    if (k < 0) {
      return BigInt.ZERO;
    }
    if (k < BigNumber.BI_TEN_POWERS_MAX) {
      if (k < BigNumber.BI_TEN_POWERS.length) {
        return BigNumber.BI_TEN_POWERS[k];
      } else {
        return BigNumber.expandBigIntTenPowers(k);
      }
    }
    if (BigNumber.BI_TEN_POWERS.length < BigNumber.BI_TEN_POWERS_MAX) {
      return BigNumber.expandBigIntTenPowers(BigNumber.BI_TEN_POWERS_MAX - 1)
        .mul(BigNumber.tenToThe(k - BigNumber.BI_TEN_POWERS_MAX + 1));
    }
    return BigNumber.BI_TEN_POWERS[BigNumber.BI_TEN_POWERS.length - 1]
      .mul(BigNumber.tenToThe(k - BigNumber.BI_TEN_POWERS.length + 1));
  }

  /**
   * Expand the BigNumber.BIG_TEN_POWERS_TABLE array to contain at least 10**n.
   *
   * @param n the power of ten to be returned (>=0)
   * @return BigInt with the value (10<sup>n</sup>) and
   *         in the meantime, the BigNumber.BIG_TEN_POWERS_TABLE array gets
   *         expanded to a size greater than n.
   */
  private static expandBigIntTenPowers(n: i32): BigInt {
    const curLen: i32 = BigNumber.BI_TEN_POWERS.length;
    let newLen: i32 = curLen << 1;
    while (newLen <= n) {
      newLen <<= 1;
    }

    for (let i = curLen; i < newLen; i++) {
      BigNumber.BI_TEN_POWERS[i] = BigNumber.BI_TEN_POWERS[i - 1].mulInt(10);
    }
    return BigNumber.BI_TEN_POWERS[n];
  }

  // ARITHMETIC SUPPORT ////////////////////////////////////////////////////////

  // Compare Normalize dividend & divisor so that both fall into [0.1, 0.999...]
  private static compareMagnitudeNormalized(left: BigInt, leftE: i32, right: BigInt, rightE: i32): i32 {
    const eDiff: i32 = leftE - rightE;
    if (eDiff < 0) {
      return BigNumber.mulPowTen(left, -eDiff).magCompareTo(right);
    } else {
      return left.magCompareTo(BigNumber.mulPowTen(right, eDiff));
    }
  }

  // ROUNDING LOGIC ////////////////////////////////////////////////////////////

  /**
   * Divides two BigInts and rounds based on the passed in rounding.
   */
  private static divideAndRound(dividend: BigInt, divisor: BigInt, rounding: Rounding): BigInt {
    const intDiv: BigInt[] = dividend.divMod(divisor);
    const quotient: BigInt = intDiv[0];
    const remainder: BigInt = intDiv[1];

    if (!remainder.isZero()) {
      if (BigNumber.needIncrement(divisor, rounding, quotient.isNegative ? -1 : 1, quotient, remainder)) {
        return quotient.isNegative ? quotient.subInt(1) : quotient.addInt(1);
      }
    }
    return quotient;
  }

  private static divideAndRoundInt(dividend: BigInt, divisor: u32, rounding: Rounding): BigInt {
    const intDiv: BigInt[] = dividend.divModInt(divisor);
    const quotient: BigInt = intDiv[0];
    const remainder: BigInt = intDiv[1];

    if (!remainder.isZero()) {
      if (BigNumber.needIncrement(BigInt.fromUInt32(divisor), rounding, quotient.isNegative ? -1 : 1, quotient, remainder)) {
        return quotient.isNegative ? quotient.subInt(1) : quotient.addInt(1);
      }
    }
    return quotient;
  }

  /**
   * Tests if quotient has to be incremented according the rounding
   */
  private static needIncrement(divisor: BigInt, rounding: Rounding, qsign: i32, quotient: BigInt, remainder: BigInt): boolean {
    if (remainder.isZero()) {
      return false;
    }
    switch(rounding) {
      case Rounding.NONE:
        throw new Error("Rounding necessary");
      case Rounding.UP: // Away from zero
        return true;
      case Rounding.DOWN: // Towards zero
        return false;
      case Rounding.CEIL: // Towards +infinity
        return qsign > 0;
      case Rounding.FLOOR: // Towards -infinity
        return qsign < 0;
      default:
        const cmpHalf: i32 = remainder.magCompareTo(divisor.div2());
        if (cmpHalf < 0 ) { // We're closer to higher digit
          return false;
        } else if (cmpHalf > 0 ) { // We're closer to lower digit
          return true;
        } else { // half-way
          switch(rounding) {
            case Rounding.HALF_DOWN:
              return false;
            case Rounding.HALF_UP:
              return true;
            case Rounding.HALF_EVEN:
              return quotient.isOdd();
            default:
              throw new Error("Unknown rounding type");
          }
        }
    }
  }

  private roundToPlaces(places: i32, rounding: Rounding): BigNumber {
    if (this.e < places) {
      return this;
    }

    let m: BigInt = this.m;
    let e: i32 = this.e;

    let pDiff: i32 = e - places;
    while (pDiff > 0 && !m.isZero()) {
      e = BigNumber.overflowGuard(<i64>e - pDiff);
      m = BigNumber.divideAndRoundByPowTen(m, pDiff, rounding);
      pDiff = e - places;
    }

    return new BigNumber(m, e, -1);
  }

  // SUPPORT UTILS /////////////////////////////////////////////////////////////

  /**
   * Returns the length of the absolute value of a BigInteger, in
   * decimal digits.
   *
   * @param b the BigInteger
   * @return the length of the unscaled value, in decimal digits
   */
  private static intLength(b: BigInt): i32 {
    if (b.isZero()) {
      return 1;
    }
    // Using 646456993/2^31 as an approximation of log10(2) is accurate up to max possible reported bitLength.
    const r: i32 = <i32>(((<i64>b.countBits() + 1) * 646456993) >>> 31);
    return b.magCompareTo(BigNumber.tenToThe(r)) < 0 ? r : r + 1;
  }

  // MAINTENANCE FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Remove insignificant trailing zeros from this
   * {@code BigInteger} value until the preferred scale is reached or no
   * more zeros can be removed.  If the preferred scale is less than
   * Integer.MIN_VALUE, all the trailing zeros will be removed.
   *
   * @return new {@code BigDecimal} with a scale possibly reduced
   * to be closed to the preferred scale.
   */
  private static trimZeros(val: BigInt, e: i32, preferredE: i64): BigNumber {
    if (e <= preferredE) {
      return new BigNumber(val, e, 0);
    }
    let newM: BigInt = val;
    let newE: i32 = e;
    const TEN: BigInt = BigInt.fromUInt16(10);
    while (newM.magCompareTo(TEN) >= 0 && !newM.isOdd()) {
      const qr: BigInt[] = newM.divModInt(10);
      if (!qr[1].isZero()) {
        break;
      }
      newM = qr[0];
      newE = BigNumber.overflowGuard(<i64>newE - 1, newM.isZero());
      if (newE <= preferredE) {
        break;
      }
    }
    return new BigNumber(newM, newE, 0);
  }

  // SYNTAX SUGAR ///////////////////////////////////////////////////////////////////////////////////////////////////

  static eq<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.eq(b);
  }

  @operator("==")
  private static eqOp(left: BigNumber, right: BigNumber): boolean {
    return left.eq(right);
  }

  static ne<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.ne(b);
  }

  @operator("!=")
  private static neOp(left: BigNumber, right: BigNumber): boolean {
    return left.ne(right);
  }

  static lt<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.lt(b);
  }

  @operator("<")
  private static ltOp(left: BigNumber, right: BigNumber): boolean {
    return left.lt(right);
  }

  static lte<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.lte(b);
  }

  @operator("<=")
  private static lteOp(left: BigNumber, right: BigNumber): boolean {
    return left.lte(right);
  }

  static gt<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.gt(b);
  }

  @operator(">")
  private static gtOp(left: BigNumber, right: BigNumber): boolean {
    return left.gt(right);
  }

  static gte<T, U>(left: T, right: U): boolean {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.gte(b);
  }

  @operator(">=")
  private static gteOp(left: BigNumber, right: BigNumber): boolean {
    return left.gte(right);
  }

  static add<T, U>(left: T, right: U): BigNumber {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.add(b);
  }

  @operator("+")
  private static addOp(left: BigNumber, right: BigNumber): BigNumber {
    return left.add(right);
  }

  static sub<T, U>(left: T, right: U): BigNumber {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.sub(b);
  }

  @operator("-")
  private static subOp(left: BigNumber, right: BigNumber): BigNumber {
    return left.sub(right);
  }

  static mul<T, U>(left: T, right: U, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.mul(b, precision, rounding);
  }

  @operator("*")
  private static mulOp(left: BigNumber, right: BigNumber): BigNumber {
    return left.mul(right, BigNumber.DEFAULT_PRECISION, BigNumber.DEFAULT_ROUNDING);
  }

  static div<T, U>(left: T, right: U, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const a: BigNumber = BigNumber.from(left);
    const b: BigNumber = BigNumber.from(right);
    return a.div(b, precision, rounding);
  }

  @operator("/")
  private static divOp(left: BigNumber, right: BigNumber): BigNumber {
    return left.div(right, BigNumber.DEFAULT_PRECISION, BigNumber.DEFAULT_ROUNDING);
  }

  static sqrt<T>(x: T): BigNumber {
    const val: BigNumber = BigNumber.from(x);
    return val.sqrt();
  }

  static pow<T>(base: T, k: i32, precision: i32 = BigNumber.DEFAULT_PRECISION, rounding: Rounding = BigNumber.DEFAULT_ROUNDING): BigNumber {
    const val: BigNumber = BigNumber.from(base);
    return val.pow(k, precision, rounding);
  }

  @operator("**")
  private static powOp(left: BigNumber, right: BigNumber): BigNumber {
    if (!right.isInteger) {
      throw new Error("Exponent must be an integer value");
    }
    return left.pow(right.m.toInt32());
  }
}
