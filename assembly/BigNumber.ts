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
  private readonly m: BigInt;
  // Scale; A BigNumber takes the form m * 10^-e
  private readonly e: i32;
  // Limits the length of the mantissa
  private _precision: i32;
  get precision(): i32 {
    if (this._precision <= 0) {
      this._precision = BigNumber.intLength(this.m);
    }
    return this._precision;
  }

  // 155, the number of digits in the maximum value of a 512 bit integer
  public static defaultPrecision: i32 = 155;
  public static defaultRounding: Rounding = Rounding.HALF_UP;

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

  static fromFraction(numerator: BigInt, denominator: BigInt, precision: i32 = BigNumber.defaultPrecision, rounding: Rounding = BigNumber.defaultRounding): BigNumber {
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
  static fromString(val: string, precision: i32 = BigNumber.defaultPrecision, rounding: Rounding = BigNumber.defaultRounding): BigNumber {
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
    let eMark: i64 = 0; // exponential notation mark
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
      eMark = BigNumber.parseExp(val, offset, len);
      break;
    }

    // Check if digits
    if (p == 0) {
      throw new Error("No digits found.");
    }
    // Adjust scale if exp is not zero
    if (eMark != 0) {
      exponent = BigNumber.adjustScale(exponent, eMark);
    }

    // Remove leading zeros from precision (digits count)
    mantissa = BigInt.fromString((isNeg ? "-" : "") + String.fromCharCodes(codes));
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
      const trailingZeros: i32 = BigNumber.overflowGuard(<i64>-trimmed.e);
      const mString: string = trimmed.m.toString();
      return mString.padEnd(mString.length + trailingZeros, "0");
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

  toFixed(places: i32 = 18, rounding: Rounding = BigNumber.defaultRounding): string {
    const trimmed: BigNumber = BigNumber.trimZeros(this.m, this.e, I32.MIN_VALUE);
    const intLength: i64 = <i64>trimmed.precision - trimmed.e;
    const clampedLen: i64 = intLength > 0 ? intLength : 0;
    const precision: i32 = BigNumber.overflowGuard(clampedLen + places);
    // negative precision corresponds to empty string
    if (precision <= 0) {
      return "0";
    }
    // not rounding corresponds to rounding down in this case
    const round: Rounding = rounding == Rounding.NONE ? Rounding.DOWN : rounding;
    const res: BigNumber = BigNumber.doRound(trimmed, precision, round);
    let resStr: string = res.toString();
    // decimal number results may need padded zeros
    if (places > 0) {
      if (trimmed.e <= 0) {
        // integer number returned in decimal form
        return resStr + ".".padEnd(1 + places, "0");
      } else {
        // decimal number returned in decimal form
        return resStr.padEnd(precision + 1 + trimmed.isNegative, "0");
      }
    } else {
      // number returned in integer form -> may need trimming
      return res.toString().substring(0, precision + trimmed.isNegative);
    }
  }

  toSignificant(digits: i32 = 18, rounding: Rounding = BigNumber.defaultRounding): string {
    if (digits <= 0) {
      return "0";
    }
    const trimmed: BigNumber = BigNumber.trimZeros(this.m, this.e, I32.MIN_VALUE);
    // not rounding corresponds to rounding down in this case
    const round: Rounding = rounding == Rounding.NONE ? Rounding.DOWN : rounding;
    const res: BigNumber = BigNumber.doRound(trimmed, digits, round);
    return res.toString(); // TODO: add 0 if rounding adds a zero
  }

  toBigInt(): BigInt {
    return this.floor().m.copy();
  }

  // COMPARISON OPERATORS //////////////////////////////////////////////////////////////////////////////////////////////

  @operator("==")
  eq(other: BigNumber): boolean {
    return this.compareTo(other) == 0;
  }

  @operator("!=")
  ne(other: BigNumber): boolean {
    return !this.eq(other);
  }

  @operator("<")
  lt(other: BigNumber): boolean {
    return this.compareTo(other) < 0;
  }

  @operator("<=")
  lte(other: BigNumber): boolean {
    return this.compareTo(other) <= 0;
  }

  @operator(">")
  gt(other: BigNumber): boolean {
    return this.compareTo(other) > 0;
  }

  @operator(">=")
  gte(other: BigNumber): boolean {
    return this.compareTo(other) >= 0;
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

  @operator("+")
  add(other: BigNumber): BigNumber {
    let left: BigInt = this.m;
    let right: BigInt = other.m;
    let exponent: i32;
    if (this.e >= other.e) {
      const rescale: i32 = BigNumber.overflowGuard(<i64>this.e - other.e, right.isZero());
      right = BigNumber.mulPowTen(right, rescale);
      exponent = this.e;
    } else {
      const rescale: i32 = BigNumber.overflowGuard(<i64>other.e - this.e, left.isZero());
      left = BigNumber.mulPowTen(left, rescale);
      exponent = other.e;
    }
    return new BigNumber(left.add(right), exponent, 0);
  }

  @operator("-")
  sub(other: BigNumber): BigNumber {
    return this.add(other.opposite());
  }

  @operator("*")
  mul(other: BigNumber, precision: i32 = BigNumber.defaultPrecision, rounding: Rounding = BigNumber.defaultRounding): BigNumber {
    const left: BigInt = this.m;
    const right: BigInt = other.m;
    const m: BigInt = left.mul(right);
    const e: i32 = BigNumber.overflowGuard( <i64>this.e + other.e, this.m.isZero());
    const unrounded: BigNumber = new BigNumber(m, e, BigNumber.intLength(m));
    return BigNumber.doRound(unrounded, precision, rounding);
  }

  /**
   * Divides two BigNumbers and rounds result
   */
  @operator("/")
  div(other: BigNumber, precision: i32 = BigNumber.defaultPrecision, rounding: Rounding = BigNumber.defaultRounding): BigNumber {
    if (other.m.isZero()) {
      throw new Error("Divide by zero");
    }
    if (this.m.isZero()) {
      return new BigNumber(this.m.copy(), BigNumber.overflowGuard(this.e - other.e, true), this.precision);
    }
    let left: BigInt = this.m;
    let right: BigInt = other.m;
    const leftP: i32 = this.precision;
    let rightP: i32 = other.precision;
    const eDiff: i32 = BigNumber.overflowGuard(this.e - other.e);
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
      const newScale: i32 = BigNumber.overflowGuard(<i64>leftP - precision);
      const rescale: i32 = BigNumber.overflowGuard(<i64>newScale - rightP);
      right = BigNumber.mulPowTen(right, rescale);
    }
    const quotient: BigInt = BigNumber.divideAndRound(left, right, rounding);
    // clean up and round
    const res: BigNumber = BigNumber.trimZeros(quotient, e, eDiff);
    return BigNumber.doRound(res, precision, rounding);
  }

  // UTILITIES /////////////////////////////////////////////////////////////////////////////////////////////////////////

  // TODO: max, min, round, sqrt, pow

  get isNegative(): boolean {
    return this.m.isNegative;
  }

  isZero(): boolean {
    return this.m.isZero();
  }

  floor(): BigNumber {
    const intLen: i64 = <i64>this.precision - this.e;
    const precision: i32 = BigNumber.overflowGuard(intLen > 0 ? intLen : 0);
    return BigNumber.doRound(this, precision, Rounding.FLOOR);
  }

  ceil(): BigNumber {
    const intLen: i64 = <i64>this.precision - this.e;
    const precision: i32 = BigNumber.overflowGuard(intLen > 0 ? intLen : 0);
    return BigNumber.doRound(this, precision, Rounding.CEIL);
  }

  setScale(e: i32, rounding: Rounding): BigNumber {
    if (e == this.e) {
      return this.copy();
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
      const rescale: i32 = BigNumber.overflowGuard(<i64>this.e - e);
      const divisor: BigInt = BigNumber.tenToThe(rescale);
      const m: BigInt = BigNumber.divideAndRound(this.m, divisor, rounding);
      return new BigNumber(m, e, BigNumber.intLength(m));
    }
  }

  // SYNTACTIC SUGAR ///////////////////////////////////////////////////////////////////////////////////////////////////

  static eq(left: BigNumber, right: BigNumber): boolean {
    return left.eq(right);
  }

  static ne(left: BigNumber, right: BigNumber): boolean {
    return left.ne(right);
  }

  static lt(left: BigNumber, right: BigNumber): boolean {
    return left.lt(right);
  }

  static lte(left: BigNumber, right: BigNumber): boolean {
    return left.lte(right);
  }

  static gt(left: BigNumber, right: BigNumber): boolean {
    return left.gt(right);
  }

  static gte(left: BigNumber, right: BigNumber): boolean {
    return left.gte(right);
  }

  static add(left: BigNumber, right: BigNumber): BigNumber {
    return left.add(right);
  }

  static sub(left: BigNumber, right: BigNumber): BigNumber {
    return left.sub(right);
  }

  static mul(left: BigNumber, right: BigNumber): BigNumber {
    return left.mul(right);
  }

  static div(left: BigNumber, right: BigNumber): BigNumber {
    return left.div(right);
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
      throw new Error("No digits following exponential mark");
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
      let v: i32;
      if (code >= 48 && code <= 57) {
        v = code - 48;
      } else {
        throw new Error("Not a digit");
      }
      exp = exp * 10 + v;
      if (len == 1) {
        break; // that was final character
      }
      offset++;
      char = val.charAt(offset);
    }

    // apply sign
    if (negexp) {
      exp = -exp;
    }
    return BigNumber.overflowGuard(exp, false);
  }

  // SCALE SUPPORT /////////////////////////////////////////////////////////////

  private static adjustScale(scale: i32, exp: i64): i32 {
    const adjustedScale: i64 = <i64>scale - exp;
    if (adjustedScale > I32.MAX_VALUE || adjustedScale < I32.MIN_VALUE) {
      throw new Error("Scale out of range.");
    }
    return <i32>adjustedScale;
  }

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
   return BigNumber.BI_TEN_POWERS[BigNumber.BI_TEN_POWERS_MAX - 1].mul(BigNumber.tenToThe(k - BigNumber.BI_TEN_POWERS_MAX + 1));
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
      if (BigNumber.needIncrement(divisor.abs(), rounding, quotient.isNegative ? -1 : 1, quotient.abs(), remainder.abs())) {
        return quotient.isNegative ? quotient.sub(BigInt.ONE) : quotient.add(BigInt.ONE);
      }
    }
    return quotient;
  }

  private static divideAndRoundInt(dividend: BigInt, divisor: u32, rounding: Rounding): BigInt {
    const intDiv: BigInt[] = dividend.divModInt(divisor);
    const quotient: BigInt = intDiv[0];
    const remainder: BigInt = intDiv[1];

    if (!remainder.isZero()) {
      if (BigNumber.needIncrement(BigInt.fromUInt32(divisor), rounding, quotient.isNegative ? -1 : 1, quotient.abs(), remainder.abs())) {
        return quotient.isNegative ? quotient.sub(BigInt.ONE) : quotient.add(BigInt.ONE);
      }
    }
    return quotient;
  }

  /**
   * Returns a {@code BigDecimal} rounded according to the MathContext
   * settings;
   * If rounding is needed a new {@code BigDecimal} is created and returned.
   */
  private static doRound(val: BigNumber, precision: i32, rounding: Rounding): BigNumber {
    if (precision <= 0 || val.precision <= precision) {
      return val;
    }
    let m: BigInt = val.m;
    let e: i32 = val.e;
    let prec: i32 = val.precision;
    let pDiff: i32 = prec - precision;
    while (pDiff > 0) {
      e = BigNumber.overflowGuard(<i64>e - pDiff);
      m = BigNumber.divideAndRoundByPowTen(m, pDiff, rounding);
      prec = BigNumber.intLength(m);
      pDiff = prec - precision;
    }
    return new BigNumber(m, e, prec);
  }

  /**
   * Tests if quotient has to be incremented according the rounding
   */
  private static needIncrement(divisor: BigInt, rounding: Rounding, qsign: i32, quotient: BigInt, remainder: BigInt): boolean {
    if (remainder.isZero()) {
      throw new Error("Remainder is zero");
      // return false;
    }
    // TODO: possible optimization here -> see java implementation;
    // TODO: if i use magCompateTo here, then I don't think I need the abs values of args
    const cmpHalf: i32 = remainder.compareTo(divisor.div2());
    const isOdd: boolean = quotient.isOdd();
    return BigNumber.commonNeedIncrement(rounding, qsign, cmpHalf, isOdd);
  }

  /**
   * Shared logic of need increment computation.
   */
  private static commonNeedIncrement(rounding: Rounding, qsign: i32, cmpHalf: i32, isOdd: boolean): boolean {
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
              return isOdd;
            default:
              throw new Error("Unknown rounding type");
          }
        }
    }
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
}
