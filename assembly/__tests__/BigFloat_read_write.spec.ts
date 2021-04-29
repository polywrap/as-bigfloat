import { BigFloat, Rounding } from "../BigFloat";
import { BigInt } from "as-bigint";


describe("Reads and writes strings", () => {

  it("Constructs from radix 10 string", () => {
    let arr: string[] = [
      "100.12",
      "0.452346346",
      "0.3252352",
      "3257235.2305829",
      "2.352358293852353252",
      "3259235823280734598273407234235353125134634513523513451235325.234231",
      "-3257235.2305829",
      "-0.3252352",
      "3257235.0",
      "-3257235.0",
    ]
    for (let i = 0; i < arr.length; i++) {
      const str: string = arr[i];
      const bigFloat: BigFloat = BigFloat.fromString(str);
      expect(bigFloat.toString()).toStrictEqual(str);
    }
  });

  it("Adjusts exponent when reading string with leading or trailing zeros", () => {
    const str1 = "000100.12";
    let bigFloat: BigFloat = BigFloat.fromString(str1);
    expect(bigFloat.toString()).toStrictEqual("100.12");

    const str2 = "00.000452346346";
    bigFloat = BigFloat.fromString(str2);
    expect(bigFloat.toString()).toStrictEqual("0.000452346346");

    const str3 = "3259235823280734598273407234235353125134634513523513451235325.0000234231";
    bigFloat = BigFloat.fromString(str3);
    expect(bigFloat.toString()).toStrictEqual("3259235823280734598273407234235353125134634513523513451235325.0000234231");

    const str4 = "-0003257235.2305829";
    bigFloat = BigFloat.fromString(str4);
    expect(bigFloat.toString()).toStrictEqual("-3257235.2305829");

    const str5 = "-0.32523520000";
    bigFloat = BigFloat.fromString(str5);
    expect(bigFloat.toString()).toStrictEqual("-0.3252352");

    const str6 = "00000325723500000";
    bigFloat = BigFloat.fromString(str6);
    expect(bigFloat.toString()).toStrictEqual("325723500000.0");

    const str7 = "-.0000454";
    bigFloat = BigFloat.fromString(str7);
    expect(bigFloat.toString()).toStrictEqual("-0.0000454");

  });

  it("Pads output with leading zero when number < 1", () => {
    const str: string = ".2523523";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toString()).toStrictEqual("0" + str);

    const strNeg: string = "-.2523523";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toString()).toStrictEqual("-0.2523523");
  });

  it("Prints output with requested precision", () => {
    const str: string = "32523523.2523523876898768968758746536366758876969980005079946476535";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toString(18)).toStrictEqual("32523523.252352387689876896");
    expect(bigFloat.toString(23)).toStrictEqual("32523523.25235238768987689687587");
    expect(bigFloat.toString(6)).toStrictEqual("32523523.252352");
    expect(bigFloat.toString(0)).toStrictEqual("32523523");

    const strNeg: string = "-.2523523246973279271980798143097";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toString(3)).toStrictEqual("-0.252");
    expect(bigFloatNeg.toString(57)).toStrictEqual("-0.2523523246973279271980798143097");
    expect(bigFloatNeg.toString(19)).toStrictEqual("-0.2523523246973279271");
    expect(bigFloatNeg.toString(0)).toStrictEqual("0");
  });

  it("Prints output with fixed precision", () => {
    const str: string = "32523523.252352";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toString(18, true)).toStrictEqual("32523523.252352000000000000");
    expect(bigFloat.toString(23, true)).toStrictEqual("32523523.25235200000000000000000");
    expect(bigFloat.toString(5, true)).toStrictEqual("32523523.25235");
    expect(bigFloat.toString(0, true)).toStrictEqual("32523523");

    const strNeg: string = "-.00252352";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toString(3, true)).toStrictEqual("-0.002");
    expect(bigFloatNeg.toString(10, true)).toStrictEqual("-0.0025235200");
    expect(bigFloatNeg.toString(8, true)).toStrictEqual("-0.00252352");
    expect(bigFloatNeg.toString(2, true)).toStrictEqual("0.00");
    expect(bigFloatNeg.toString(0, true)).toStrictEqual("0");
  });

});

describe("Formatted output", () => {

  it("Prints output with fixed precision rounded down", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toFixed(18, Rounding.ROUND_DOWN)).toStrictEqual("32523523.252352700000000000");
    expect(bigFloat.toFixed(5, Rounding.ROUND_DOWN)).toStrictEqual("32523523.25235");
    expect(bigFloat.toFixed(6, Rounding.ROUND_DOWN)).toStrictEqual("32523523.252352");
    expect(bigFloat.toFixed(7, Rounding.ROUND_DOWN)).toStrictEqual("32523523.2523527");
    expect(bigFloat.toFixed(0, Rounding.ROUND_DOWN)).toStrictEqual("32523523");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toFixed(3, Rounding.ROUND_DOWN)).toStrictEqual("-0.002");
    expect(bigFloatNeg.toFixed(10, Rounding.ROUND_DOWN)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toFixed(9, Rounding.ROUND_DOWN)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toFixed(8, Rounding.ROUND_DOWN)).toStrictEqual("-0.00252352");
    expect(bigFloatNeg.toFixed(2, Rounding.ROUND_DOWN)).toStrictEqual("0.00");
    expect(bigFloatNeg.toFixed(0, Rounding.ROUND_DOWN)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toFixed(3, Rounding.ROUND_DOWN)).toStrictEqual("-12.002");
  });

  it("Prints output with fixed precision rounded up", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toFixed(18, Rounding.ROUND_UP)).toStrictEqual("32523523.252352700000000000");
    expect(bigFloat.toFixed(5, Rounding.ROUND_UP)).toStrictEqual("32523523.25236");
    expect(bigFloat.toFixed(6, Rounding.ROUND_UP)).toStrictEqual("32523523.252353");
    expect(bigFloat.toFixed(7, Rounding.ROUND_UP)).toStrictEqual("32523523.2523527");
    expect(bigFloat.toFixed(0, Rounding.ROUND_UP)).toStrictEqual("32523524");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toFixed(3, Rounding.ROUND_UP)).toStrictEqual("-0.003");
    expect(bigFloatNeg.toFixed(10, Rounding.ROUND_UP)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toFixed(9, Rounding.ROUND_UP)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toFixed(8, Rounding.ROUND_UP)).toStrictEqual("-0.00252353");
    expect(bigFloatNeg.toFixed(2, Rounding.ROUND_UP)).toStrictEqual("-0.01");
    expect(bigFloatNeg.toFixed(0, Rounding.ROUND_UP)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toFixed(3, Rounding.ROUND_UP)).toStrictEqual("-12.003");
  });

  it("Prints output with fixed precision rounded half up", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toFixed(18, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.252352700000000000");
    expect(bigFloat.toFixed(5, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.25235");
    expect(bigFloat.toFixed(6, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.252353");
    expect(bigFloat.toFixed(7, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.2523527");
    expect(bigFloat.toFixed(0, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toFixed(3, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.003");
    expect(bigFloatNeg.toFixed(10, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toFixed(9, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toFixed(8, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.00252353");
    expect(bigFloatNeg.toFixed(2, Rounding.ROUND_HALF_UP)).toStrictEqual("0.00");
    expect(bigFloatNeg.toFixed(0, Rounding.ROUND_HALF_UP)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toFixed(3, Rounding.ROUND_HALF_UP)).toStrictEqual("-12.003");
  });

  it("Prints output with requested significant digits, rounded down", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toSignificant(18, Rounding.ROUND_DOWN)).toStrictEqual("32523523.2523527000");
    expect(bigFloat.toSignificant(5, Rounding.ROUND_DOWN)).toStrictEqual("32523000");
    expect(bigFloat.toSignificant(8, Rounding.ROUND_DOWN)).toStrictEqual("32523523");
    expect(bigFloat.toSignificant(9, Rounding.ROUND_DOWN)).toStrictEqual("32523523.2");
    expect(bigFloat.toSignificant(10, Rounding.ROUND_DOWN)).toStrictEqual("32523523.25");
    expect(bigFloat.toSignificant(0, Rounding.ROUND_DOWN)).toStrictEqual("0");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toSignificant(3, Rounding.ROUND_DOWN)).toStrictEqual("-0.002");
    expect(bigFloatNeg.toSignificant(10, Rounding.ROUND_DOWN)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toSignificant(9, Rounding.ROUND_DOWN)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toSignificant(8, Rounding.ROUND_DOWN)).toStrictEqual("-0.00252352");
    expect(bigFloatNeg.toSignificant(2, Rounding.ROUND_DOWN)).toStrictEqual("0.00");
    expect(bigFloatNeg.toSignificant(0, Rounding.ROUND_DOWN)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toSignificant(5, Rounding.ROUND_DOWN)).toStrictEqual("-12.002");
  });

  it("Prints output with requested significant digits, rounded up", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toSignificant(18, Rounding.ROUND_UP)).toStrictEqual("32523523.2523527000");
    expect(bigFloat.toSignificant(5, Rounding.ROUND_UP)).toStrictEqual("32524000");
    expect(bigFloat.toSignificant(8, Rounding.ROUND_UP)).toStrictEqual("32523524");
    expect(bigFloat.toSignificant(9, Rounding.ROUND_UP)).toStrictEqual("32523523.3");
    expect(bigFloat.toSignificant(10, Rounding.ROUND_UP)).toStrictEqual("32523523.26");
    expect(bigFloat.toSignificant(0, Rounding.ROUND_UP)).toStrictEqual("0");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toSignificant(3, Rounding.ROUND_UP)).toStrictEqual("-0.003");
    expect(bigFloatNeg.toSignificant(10, Rounding.ROUND_UP)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toSignificant(9, Rounding.ROUND_UP)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toSignificant(8, Rounding.ROUND_UP)).toStrictEqual("-0.00252353");
    expect(bigFloatNeg.toSignificant(2, Rounding.ROUND_UP)).toStrictEqual("-0.01");
    expect(bigFloatNeg.toSignificant(0, Rounding.ROUND_UP)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toSignificant(5, Rounding.ROUND_UP)).toStrictEqual("-12.003");
  });

  it("Prints output with requested significant digits, rounded half up", () => {
    const str: string = "32523523.2523527";
    const bigFloat: BigFloat = BigFloat.fromString(str);
    expect(bigFloat.toSignificant(18, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.2523527000");
    expect(bigFloat.toSignificant(5, Rounding.ROUND_HALF_UP)).toStrictEqual("32524000");
    expect(bigFloat.toSignificant(8, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523");
    expect(bigFloat.toSignificant(9, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.3");
    expect(bigFloat.toSignificant(10, Rounding.ROUND_HALF_UP)).toStrictEqual("32523523.25");
    expect(bigFloat.toSignificant(0, Rounding.ROUND_HALF_UP)).toStrictEqual("0");

    const strNeg: string = "-.002523527";
    const bigFloatNeg: BigFloat = BigFloat.fromString(strNeg);
    expect(bigFloatNeg.toSignificant(3, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.003");
    expect(bigFloatNeg.toSignificant(10, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.0025235270");
    expect(bigFloatNeg.toSignificant(9, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.002523527");
    expect(bigFloatNeg.toSignificant(8, Rounding.ROUND_HALF_UP)).toStrictEqual("-0.00252353");
    expect(bigFloatNeg.toSignificant(2, Rounding.ROUND_HALF_UP)).toStrictEqual("0.00");
    expect(bigFloatNeg.toSignificant(0, Rounding.ROUND_HALF_UP)).toStrictEqual("0");

    const strNeg2: string = "-12.002523527";
    const bigFloatNeg2: BigFloat = BigFloat.fromString(strNeg2);
    expect(bigFloatNeg2.toSignificant(5, Rounding.ROUND_HALF_UP)).toStrictEqual("-12.003");
  });

});

describe("Construction from fractions", () => {

  it("Constructs from fraction", () => {
    let numerator = BigInt.fromString("18658916385618365863858623756183648536");
    let denominator = BigInt.fromString("392759342592734985793728970589475309737437958374985");
    let bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString()).toStrictEqual("0.000000000000047507");

    numerator = BigInt.fromString("23424380928348632480682093860823085208340453452435323");
    denominator = BigInt.fromString("392759342592734985793728970589");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(10)).toStrictEqual("59640544191047135848576.4672484774");

    numerator = BigInt.fromString("23424380928348632480682093860823085208340453452435323");
    denominator = BigInt.fromString("72865876238658638264726476289309837508973984705983743");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(24)).toStrictEqual("0.321472575882110101595481");

    numerator = BigInt.fromString("72865876238658638264726476289309837508973984705983743");
    denominator = BigInt.fromString("23424380928348632480682093860823085208340453452435323");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(15)).toStrictEqual("3.110685249763632");

    numerator = BigInt.fromString("72865876238658638264726476289309837508973984705983743");
    denominator = BigInt.fromString("2342438092834863248068209386082308520834045345243532");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString()).toStrictEqual("31.106852497636326156");

    numerator = BigInt.fromString("23424380928348632480682093860823085208340453452435323");
    denominator = BigInt.fromString("7286587623865863826472647628930983750897398470598374");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString()).toStrictEqual("3.214725758821101015");

    numerator = BigInt.fromString("-35352347978987");
    denominator = BigInt.fromString("899732432");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(29)).toStrictEqual("-39292.06808784569855318942198584656");

    numerator = BigInt.fromString("-35352347978987");
    denominator = BigInt.fromString("-899732432868687887");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(15)).toStrictEqual("0.000039292068049");

    numerator = BigInt.fromString("23627");
    denominator = BigInt.fromString("1093746923469083704986");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(30)).toStrictEqual("0.000000000000000021601889333833");

    numerator = BigInt.fromString("0003452356198560913");
    denominator = BigInt.fromString("3409689346177541");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString(30)).toStrictEqual("1.012513413408527674142557088016");

    numerator = BigInt.fromString("0");
    denominator = BigInt.fromString("-899732432868687887");
    bigFloat = BigFloat.fromFraction(numerator, denominator);
    expect(bigFloat.toString()).toStrictEqual("0");
  });

});
