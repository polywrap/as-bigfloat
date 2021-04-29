import { BigInt } from "as-bigint";

// multiple precision float
export class BigFloat {

  // a float takes the form -> m * 10^e
  private mantissa: BigInt;
  private e: i32;

  // CONSTRUCTORS //////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(mantissa: BigInt, exponent: i32) {
    this.mantissa = mantissa;
    this.e = exponent;
  }

  static fromFraction(numerator: BigInt, denominator: BigInt): BigFloat {
    const floatNumerator = new BigFloat(numerator, 0);
    const floatDenominator = new BigFloat(denominator, 0);
    return floatNumerator.div(floatDenominator);
  }

  static fromString(bigFloat: string): BigFloat {
    // determine sign
    let isNegative: boolean = bigFloat.charAt(0) == "-";
    if (isNegative) bigFloat = bigFloat.substring(1);
    // parse string
    let preDecimal: string;
    let postDecimal: string;
    let mantissa: BigInt;
    let exponent: i32;
    const i: i32 = bigFloat.indexOf(".");
    if (i == -1) {
      mantissa = BigInt.fromString(isNegative ? "-" + bigFloat : bigFloat);
      exponent = 0;
    } else {
      preDecimal = BigFloat.trimLeadingZeros(bigFloat.substring(0, i));
      let postDecimalStr: string = bigFloat.substring(i + 1);
      postDecimal = BigFloat.trimTrailingZeros(postDecimalStr);
      exponent = -1 * postDecimal.length;
      if (isNegative) {
        preDecimal = "-" + preDecimal;
      }
      mantissa = BigInt.fromString(preDecimal + postDecimal);
    }
    return new BigFloat(mantissa, exponent);
  }

  // MAINTENANCE FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////

  private static trimLeadingZeros(str: string): string {
    let i: i32 = 0;
    for (; i <= str.length; i++) {
      if (str.charAt(i) != "0") {
        break;
      }
    }
    return str.substring(i);
  }

  private static trimTrailingZeros(str: string): string {
    let i: i32 = str.length - 1;
    for (; i >= 0; i--) {
      if (str.charAt(i) != "0") {
        break;
      }
    }
    return str.substring(0, i + 1);
  }

  private normalize(): BigFloat {
    const mantissaStr: string = this.mantissa.toString();
    const trimmedMantissa: string = BigFloat.trimTrailingZeros(mantissaStr);
    const exponent: i32 = this.e + (mantissaStr.length - trimmedMantissa.length);
    return new BigFloat(BigInt.fromString(trimmedMantissa), exponent);
  }

  // OUTPUT ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  toString(precision: i32 = 18, fixed: boolean = false): string {
    // trivial case
    if (this.mantissa.isZero()) {
      if (fixed) {
        return "0.".padEnd(precision + 2, "0");
      }
      return "0";
    }
    // prep for other cases
    let m: string = this.mantissa.toString();
    let result: string = "";
    if (this.isNegative) {
      result += "-";
      m = m.substring(1);
    }
    // positive integer
    if (this.e > 0) {
      result = result.padEnd(m.length + this.e, "0");
      if (precision > 0) {
        result += fixed ? ".".padEnd(precision + 1, "0") : ".0";
      }
    // number < 1
    } else if (this.e + m.length <= 0) {
      const isZeroFromLowPrecision: boolean = this.e + m.length <= -1 * precision;
      if (precision == 0 || !fixed && isZeroFromLowPrecision) {
        return "0"
      }
      if (fixed && isZeroFromLowPrecision) {
        return "0.".padEnd(precision + 2, "0");
      }
      result += "0."
      m = m.padStart(-1 * this.e, "0");
      m = m.substr(0, precision);
      if (fixed) {
        m = m.padEnd(precision, "0");
      } else {
        m = BigFloat.trimTrailingZeros(m);
      }
      result += m;
    // other decimal numbers
    } else {
      result += m.substring(0, m.length + this.e);
      if (precision > 0) {
        let postDecimal: string = m.substr(m.length + this.e, precision);
        postDecimal = fixed ? postDecimal.padEnd(precision, "0") : BigFloat.trimTrailingZeros(postDecimal);
        result += ".";
        result += postDecimal.length > 0 ? postDecimal : "0";
      }
    }
    return result;
  }

  toFixed(decimalPlaces: i32 = 18, rounding: i32 = Rounding.ROUND_HALF_UP): string {
    let resultFloat: BigFloat;
    // round down is default toString behavior
    if (rounding == Rounding.ROUND_DOWN) {
      resultFloat = this;
    } else {
      const extraDecimalStr: string = this.toString(decimalPlaces + 1, true);
      const lastDigit: i32 = I32.parseInt(extraDecimalStr.charAt(extraDecimalStr.length - 1));
      // check if we will round down
      if (rounding == Rounding.ROUND_HALF_UP && lastDigit < 5 || lastDigit == 0) {
        resultFloat = this;
      // we will round up
      } else {
        resultFloat = BigFloat.fromString(extraDecimalStr);
        const ten: BigInt = BigInt.fromUInt16(<u16>10);
        if (this.isNegative) {
          resultFloat.mantissa = resultFloat.mantissa.sub(ten)
        } else {
          resultFloat.mantissa = resultFloat.mantissa.add(ten);
        }
      }
    }
    return resultFloat.toString(decimalPlaces, true);
  }

  toSignificant(significantDigits: i32 = 18, rounding: i32 = Rounding.ROUND_HALF_UP): string {
    if (significantDigits == 0) {
      return "0";
    }
    const floatString: string = this.toString(significantDigits + 1);
    const decimalIndex: i32 = floatString.indexOf(".");
    const isNegative: bool = this.isNegative ? 1 : 0;
    let isLessThanOne: bool;
    if (isNegative) {
      isLessThanOne = decimalIndex == 2 && floatString.charAt(1) == "0" ? 1 : 0;
    } else {
      isLessThanOne = decimalIndex == 1 && floatString.charAt(0) == "0" ? 1 : 0;
    }
    // result includes decimal part or uses it for rounding
    if (significantDigits >= decimalIndex - isNegative - isLessThanOne) {
      const decimalPlaces: i32 = significantDigits - (decimalIndex - isNegative - isLessThanOne);
      return this.toFixed(decimalPlaces, rounding);
    // result includes only whole numbers and doesn't use decimal part
    } else if (rounding == Rounding.ROUND_DOWN) {
        return floatString.substring(0, significantDigits).padEnd(decimalIndex, "0");
    } else {
      let extraDigitStr: string = floatString.substring(0, significantDigits) + "." + floatString.charAt(significantDigits);
      return BigFloat.fromString(extraDigitStr).toFixed(0, rounding).padEnd(decimalIndex, "0");
    }
  }

  floor(): BigInt {
    return BigInt.fromString(this.toString(0));
  }

  ceil(): BigInt {
    return BigInt.fromString(this.toFixed(0, Rounding.ROUND_UP));
  }

  // COMPARISON OPERATORS //////////////////////////////////////////////////////////////////////////////////////////////
  
  @operator("==")
  eq(other: BigFloat): boolean {
    return this.compareTo(other) == 0;
  }

  @operator("!=")
  ne(other: BigFloat): boolean {
    return !this.eq(other);
  }

  @operator("<")
  lt(other: BigFloat): boolean {
    return this.compareTo(other) < 0;
  }

  @operator("<=")
  lte(other: BigFloat): boolean {
    return this.compareTo(other) <= 0;
  }

  @operator(">")
  gt(other: BigFloat): boolean {
    return this.compareTo(other) > 0;
  }

  @operator(">=")
  gte(other: BigFloat): boolean {
    return this.compareTo(other) >= 0;
  }

  compareTo(other: BigFloat): i32 {
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

  magCompareTo(other: BigFloat): i32 {
    const thisString: string = this.toString(1000);
    const thisDecimalIndex: i32 = thisString.indexOf(".");
    const otherString: string = other.toString(1000);
    const otherDecimalIndex: i32 = otherString.indexOf(".");
    // compare whole number parts
    let thisInt: BigInt;
    let otherInt: BigInt;
    if (thisDecimalIndex == -1) {
      thisInt = BigInt.fromString(thisString);
    } else {
      thisInt = BigInt.fromString(thisString.substring(0, thisDecimalIndex));
    }
    if (otherDecimalIndex == -1) {
      otherInt = BigInt.fromString(otherString);
    } else {
      otherInt = BigInt.fromString(otherString.substring(0, otherDecimalIndex));
    }
    const intCompare = thisInt.magCompareTo(otherInt);
    if (intCompare != 0) {
      return intCompare
    }
    // compare decimal parts
    let thisDecimal: string;
    let otherDecimal: string;
    if (thisDecimalIndex == -1) {
      thisDecimal = "0";
    } else {
      thisDecimal = thisString.substring(thisString.indexOf(".") + 1);
    }
    if (otherDecimalIndex == -1) {
      otherDecimal = "0"
    } else {
      otherDecimal = otherString.substring(otherString.indexOf(".") + 1);
    }
    const minLen = thisDecimal.length < otherDecimal.length ? thisDecimal.length : otherDecimal.length;
    for (let i = 0; i < minLen; i++) {
      const thisDigit = thisDecimal.charAt(i);
      const otherDigit = otherDecimal.charAt(i);
      if (thisDigit != otherDigit) {
        const thisDigitInt = I32.parseInt(thisDigit);
        const otherDigitInt = I32.parseInt(otherDigit);
        if (thisDigitInt > otherDigitInt) return 1;
        if (thisDigitInt < otherDigitInt) return -1;
        return 0;
      }
    }
    return thisDecimal.length - otherDecimal.length;
  }

  // CORE OPERATIONS ///////////////////////////////////////////////////////////////////////////////////////////////////

  private static mulBigIntPowTen(mantissa: BigInt, k: i32): BigInt {
    while (k > 0) {
      const mulVal: i32 = k > 8 ? 8 : k;
      mantissa = mantissa.mulInt(10 ** mulVal);
      k -= mulVal;
    }
    return mantissa;
  }

  // ARITHMETIC ////////////////////////////////////////////////////////////////////////////////////////////////////////

  @operator("+")
  add(other: BigFloat): BigFloat {
    let left: BigInt = this.mantissa;
    let right: BigInt = other.mantissa;
    let exponent: i32;
    if (this.e >= other.e) {
      left = BigFloat.mulBigIntPowTen(left, this.e - other.e);
      exponent = other.e;
    } else {
      right = BigFloat.mulBigIntPowTen(right, other.e - this.e);
      exponent = this.e;
    }
    return new BigFloat(left.add(right), exponent);
  }

  @operator("-")
  sub(other: BigFloat): BigFloat {
    let left: BigInt = this.mantissa;
    let right: BigInt = other.mantissa;
    let exponent: i32;
    if (this.e >= other.e) {
      left = BigFloat.mulBigIntPowTen(left, this.e - other.e);
      exponent = other.e;
    } else {
      right = BigFloat.mulBigIntPowTen(right, other.e - this.e);
      exponent = this.e;
    }
    return new BigFloat(left.sub(right), exponent);
  }

  @operator("*")
  mul(other: BigFloat): BigFloat {
    const mantissa: BigInt = this.mantissa.mul(other.mantissa);
    const exponent: i32 = this.e + other.e;
    return new BigFloat(mantissa, exponent);
  }

  @operator("/")
  div(other: BigFloat, minPrecision: i32 = 32): BigFloat {
    let dividend: BigInt = this.mantissa;
    let divisor: BigInt = other.mantissa;
    // add padding used to maintain precision
    const dividendLen = dividend.isNegative ? dividend.toString().length - 1 : dividend.toString().length;
    const divisorLen = divisor.isNegative ? divisor.toString().length - 1 : divisor.toString().length;
    const sizeDiff: i32 = dividendLen - divisorLen > 0 ? 0 : divisorLen - dividendLen;
    const padding: i32 = minPrecision + sizeDiff;
    dividend = BigFloat.mulBigIntPowTen(dividend, padding);
    // divide
    const mantissa: BigInt = dividend.div(divisor);
    const exponent: i32 = this.e - other.e - padding;
    const res: BigFloat = new BigFloat(mantissa, exponent);
    return res.mantissa.countBits() > 384 ? res.normalize() : res;
  }


  // UTILITIES /////////////////////////////////////////////////////////////////////////////////////////////////////////

  get isNegative(): boolean {
    return this.mantissa.isNegative;
  }

  copy(): BigFloat {
    return new BigFloat(this.mantissa.copy(), this.e);
  }

  // SYNTACTIC SUGAR ///////////////////////////////////////////////////////////////////////////////////////////////////
  
  static eq(left: BigFloat, right: BigFloat): boolean {
    return left.eq(right);
  }
  
  static ne(left: BigFloat, right: BigFloat): boolean {
    return left.ne(right);
  }
  
  static lt(left: BigFloat, right: BigFloat): boolean {
    return left.lt(right);
  }
  
  static lte(left: BigFloat, right: BigFloat): boolean {
    return left.lte(right);
  }
  
  static gt(left: BigFloat, right: BigFloat): boolean {
    return left.gt(right);
  }
  
  static gte(left: BigFloat, right: BigFloat): boolean {
    return left.gte(right);
  }
  
  static add(left: BigFloat, right: BigFloat): BigFloat {
    return left.add(right);
  }
  
  static sub(left: BigFloat, right: BigFloat): BigFloat {
    return left.sub(right);
  }
  
  static mul(left: BigFloat, right: BigFloat): BigFloat {
    return left.mul(right);
  }
  
  static div(left: BigFloat, right: BigFloat): BigFloat {
    return left.div(right);
  }

}

export class Rounding {
  static ROUND_DOWN: i32 = 0;
  static ROUND_HALF_UP: i32 = 1;
  static ROUND_UP: i32 = 2;
  constructor() { }
}