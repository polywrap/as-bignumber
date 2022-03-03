# BigNumber
BigNumber is an AssemblyScript class for math with arbitrary-precision decimal and integer numbers

## Features

- Fast arithmetic operations
- Lightweight
- Immutable instances
- Core operations thoroughly tested

## Getting Started

### Installation
`npm install as-bignumber`  
or  
`yarn add as-bignumber`

### Quick start

```typescript
import { BigNumber } from "as-fraction"

// generic constructor supports string, BigInt, f32, f64, and all native integer types
const a: BigNumber = BigNumber.from("1.93");
// construct from string
const b: BigNumber = BigNumber.fromString("1.93");
// construct from BigInt
const c: BigNumber = BigNumber.fromBigInt(BigInt.from("3"));
// construct from fraction components
const d: BigNumber = BigNumber.fromFraction(BigInt.from("1"), BigInt.from("3"))

// arithmetic (operator overloads: +, -, *, /, **)
const sum: BigNumber = a.add(b);
const difference: BigNumber = a.sub(b);
const product: BigNumber = a.mul(b);
const quotient: BigNumber = a.div(b);
const exponential: BigNumber = a.pow(3);
const squared: BigNumber = a.square();
const squareRoot: BigNumber = a.sqrt();

// comparison operations (operator overloads: ==, !=, <, <=, >, >=)
const isEqual: boolean = a.eq(b);
const isNotEqual: boolean = a.ne(b);
const isLessThan: boolean = a.lt(b);
const isLessThanOrEqualTo: boolean = a.lte(b);
const isGreaterThan: boolean = a.gt(b);
const isGreaterThanOrEqualTo: boolean = a.gte(b);

// binary arithmetic and comparison operators also have static implementations
const staticProduct: BigNumber = BigNumber.mul(a, b);
const staticIsEqual: boolean = BigNumber.eq(a, b);

// instantiate new copy, absolute value, opposite, or reciprocal
const sameNumber: BigNumber = a.copy();
const positiveNumber: BigNumber = a.abs();
const oppositeSign: BigNumber = a.opposite();
const reciprocal: BigNumber = a.reciprocal();

// convenience functions
const isNegative: boolean = a.isNegative;
const isInteger: boolean = a.isInteger;
const isZeroNumber: boolean = a.isZero();
const one: BigNumber = BigNumber.ONE;
const half: BigNumber = BigNumber.HALF;

// string output
const toString: string = a.toString();
const toSignificant: string = a.toSignificant(digits, rounding);
const toFixed: string = a.toFixed(places, rounding);

// type conversions
const toBigNumber: BigNumber = a.toBigNumber();
const toBigInt: BigInt = a.toBigInt();
const toFloat: f64 = a.toFloat64();

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
```
### Rounding and Precision

Because some numbers are irrational or have infinite digits, rounding is sometimes necessary. Numbers are rounded to a 
specific number of digits, which we call 'precision'. For example, the number 123.45 has five digits, and therefore has 
a precision of 5.

By default, numbers are assigned a maximum precision of 155 for some operations. When a result of one of these 
operations would exceed 155 digits, it is rounded to the best 155 digits according to the default or specified rounding 
rule. The magnitude of a number can still exceed that of a 155 digit integer due to exponential notation.

Arithmetic operations--and other methods that may require rounding--accept optional arguments to specify the precision 
and rounding mode for the result of the operation. 

The default precision and rounding mode can be changed using static methods.

A precision less than or equal to 0 indicates that the that number has exact precision, or that the result of an 
arithmetic operation should have exact precision. This can cause operations to throw an exception when a result would 
have infinite digits.

```typescript
// rounding modes
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

// many methods accept arguments that adjust precision and rounding
const precision: i32 = 250;
const rounding: Rounding = Rounding.FLOOR;
const quotient: BigNumber = a.div(b, precision, rounding);

// default precision and rounding can be changed
BigNumber.DEFAULT_PRECISION = 155;
BigNumber.DEFAULT_ROUNDING = Rounding.HALF_UP;
```

## Contributing  

### Build  
`yarn build`  

### Test  
`yarn test`  

### Lint
`yarn lint`

To autofix lint errors:
`yarn lint:fix`

## Handling integer numbers

If you need to work with arbitrarily large integers, check out as-bigint: https://github.com/polywrap/as-bigint. The BigInt class facilitates high-performance integer arithmetic.

## Handling fractions

If you need to work with numbers represented as fractions, check out as-fraction: https://github.com/polywrap/as-fraction. The Fraction class is built on top of BigInt for high-performance fraction arithmetic.

## Acknowledgements

Polywrap developed BigNumber to use in the development tools we produce for fast, language-agnostic decentralized API development. Polywrap allows developers to interact with any web3 protocol from any language, making between-protocol composition easy. Learn more at https://polywrap.io.

as-BigNumber was influenced by [Java's BigDecimal class](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.base/share/classes/java/math/BigDecimal.java) and the [as-big package](https://github.com/ttulka/as-big).

## Contact
Please create an issue in this repository or email kris@dorg.tech
