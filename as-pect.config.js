module.exports = {
  /**
   * A set of globs passed to the glob package that qualify typescript files for testing.
   */
  include: ["assembly/__tests__/**/*.spec.ts"],
  /**
   * A set of globs passed to the glob package that qualify files to be added to each __tests__.
   */
  add: ["assembly/__tests__/**/*.include.ts"],
  /**
   * All the compiler flags needed for this __tests__ suite. Make sure that a binary file is output.
   */
  flags: {
    // "--debug": [],
    /** This is required. Do not change this. The filename is ignored, but required by the compiler. */
    "--binaryFile": ["optimized.wasm"],
    /** To enable wat file output, use the following flag. The filename is ignored, but required by the compiler. */
    // "--textFile": ["untouched.wat"],
    "--runtime": ["stub"], // Acceptable values are: full, half, stub (arena), and none,
    "--baseDir": process.cwd(),
  },
  /** Output the binary wasm file: [testname].spec.wasm */
  outputBinary: false,
  /**
   * A set of regexp that will disclude source files from testing.
   */
  disclude: [/node_modules/],
  /**
   * Add your required AssemblyScript imports here.
   */
  imports: {

  },
  /**
   * All performance statistics reporting can be configured here.
   */
  performance: {
    /** Enable performance statistics gathering. */
    enabled: true,
    /** Set the maximum number of samples to run for each __tests__. */
    maxSamples: 10000,
    /** Set the maximum __tests__ run time in milliseconds. */
    maxTestRunTime: 2000,
    /** Set the number of decimal places to round to. */
    roundDecimalPlaces: 3,
    /** Report the median time in the default reporter. */
    reportMedian: true,
    /** Report the average time in milliseconds. */
    reportAverage: true,
    /** Report the standard deviation. */
    reportStandardDeviation: false,
    /** Report the maximum run time in milliseconds. */
    reportMax: false,
    /** Report the minimum run time in milliseconds. */
    reportMin: false,
    /** Report the variance. */
    reportVariance: false,
  },
  /**
   * To create your own custom reporter, please check out the Core API.
   */
  // reporter: new CustomReporter(),
  // coverage: ['assembly/BigNumber.ts'],
};
