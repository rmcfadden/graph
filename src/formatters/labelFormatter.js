import Utils from "../utils";

export default class labelFormatter {
  constructor(args) {
    this.useExponential = (args && args.useExponential) || false;
  }

  static shouldFormatExponential(label) {
    if (typeof label !== "number") { return false; }
    const labelUnsigned = label < 0 ? label * -1 : label;
    return (labelUnsigned !== 0 && (labelUnsigned >= 1000000 || labelUnsigned <= 0.001));
  }

  format(label) {
    if (typeof label !== "number") { return label; }
    if (label !== 0 && (this.useExponential || labelFormatter.shouldFormatExponential(label))) {
      return label.toExponential(2);
    }

    const decimalPlaces = Utils.decimalPlaces(label);
    if (decimalPlaces === 0) { return label; }
    if (decimalPlaces > 3) { return parseFloat(label).toFixed(4).toLocaleString(); }
    if (decimalPlaces > 2) { return parseFloat(label).toFixed(3).toLocaleString(); }
    return label;
  }
}
