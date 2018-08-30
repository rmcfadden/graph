export default class Labels {
  constructor({
    show = true,
    style = "black",
    height = 18,
    font = "Arial",
    verticalPosition = "bottom",
    horizontalPosition = "",
    margin = 2,
    hidden = {},
  } = {}) {
    this.show = show;
    this.style = style;
    this.height = height;
    this.font = font;
    this.verticalPosition = verticalPosition;
    this.horizontalPosition = horizontalPosition;
    this.margin = margin;
    this.originHorizontalPosition = "left";
    this.leftEdgeHorizontalPosition = "right";
    this.rightEdgeHorizontalPosition = "left";
    this.topEdgeVerticalPosition = "bottom";
    this.bottomEdgeVerticalPosition = "top";
    this.showOutOfRange = true;
    this.outOfRangeStyle = "grey";
    this.preventOverlap = true;
    this.hidden = hidden;
  }
}
