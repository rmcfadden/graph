export default class Grid {
  constructor({
    type = "grid",
    show = true,
    style = "grey",
    step = 1,
    width = 0.5,
    showLabels = false,
  } = {}) {
    this.type = type;
    this.show = show;
    this.style = style;
    this.step = step;
    this.width = width;
    this.showLabels = showLabels;
    this.labelStyle = "black";
    this.labelHeight = 18;
    this.labelFont = "Arial";
    this.labelPosition = "bottom";
  }
}
