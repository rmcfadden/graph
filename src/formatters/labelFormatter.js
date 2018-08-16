import Utils from "../utils";

export default class labelFormatter {
  static format(label) {
    if (typeof label !== "number") { return label; }
    const labelUnsigned = label < 0 ? label * -1 : label;

    if (labelUnsigned !== 0 && (labelUnsigned >= 1000000 || labelUnsigned <= 0.001)) {
      return label.toExponential(3);
    }

    const decimalPlaces = Utils.decimalPlaces(label);
    if (decimalPlaces === 0) { return label; }
    if (decimalPlaces > 3) { return parseFloat(label).toFixed(4).toLocaleString(); }
    if (decimalPlaces > 2) { return parseFloat(label).toFixed(3).toLocaleString(); }
    return label;
  }
}
