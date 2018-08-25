export default class Label {
  constructor({
    show = true,
    style = "black",
    height = 18,
    font = "Arial",
    position = "bottom",
    margin = 2,
  } = {}) {
    this.show = show;
    this.style = style;
    this.height = height;
    this.font = font;
    this.position = position;
    this.margin = margin;
    this.originPosition = "left";
    this.leftEdgePosition = "right";
    this.rightEdgePosition = "left";
    //this.topEdgePosition = "bottomright";
    //this.bottomEdgePosition = "bottomleft";
  }
}
