import Utils from "./utils";

export default class GridLines {
  constructor({
    type = "grid",
    show = true,
    style = "grey",
    step = 1,
    showLabels = false,
  } = {}) {
    this.type = type;
    this.show = show;
    this.style = style;
    this.step = step;
    this.showLabels = showLabels;
    this.labelStyle = "black";
    this.labelsInNegative = true;
    this.textHeight = 16;
    this.labelFormatter = (label) => {
      if (typeof label !== "number") { return label; }
      const decimalPlaces = Utils.decimalPlaces(label);
      if (decimalPlaces === 0) { return label; }
      if (decimalPlaces > 3) { return label.toExponential(); }
      if (decimalPlaces > 2) { return parseFloat(label).toFixed(3).toLocaleString(); }
      return label;
    };
  }
}
