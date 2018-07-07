export default class GridLines {
  constructor({ type ="grid", show = true,  style = "grey", step = 1, showLabels = false } = {}) {
    this.type = type;
    this.show = show;
    this.style = style;
    this.step = step;
    this.showLabels = showLabels;
    this.labelStyle = "black";
    this.labelsInNegative = true
    this.textHeight = 16;
    this.labelFormatter = (label) =>
      typeof label === "number" ? 
      (label % 1 === 0) ? label : parseFloat(label).toFixed(1).toLocaleString()
      : label;
  }
}