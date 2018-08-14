import Calcs from "./calcs";
import Utils from "./utils";

export default class Layer {
  constructor(args) {
    this.view = args.view;
    this.graph = this.view.graph;
    this.calcs = new Calcs();
    this.xToScreen = x => this.calcs.xScreenScale * (x + this.calcs.xOffset);
    this.yToScreen = y => this.calcs.yScreenScale * (this.calcs.yOffset - y);
    this.screenToX = x => (x / this.calcs.xScreenScale) - this.calcs.xOffset;
    this.screenToY = y => this.calcs.yOffset - (y / this.calcs.yScreenScale);

    this.isInBounds = (p) => {
      const { xAxis, yAxis } = this;
      return Utils.isBetween(p.x, xAxis.start, xAxis.end)
        && Utils.isBetween(p.y, yAxis.start, yAxis.end);
    };

    this.isInScreenBounds = (p) => {
      const {
        xStart,
        xEnd,
        yStart,
        yEnd,
      } = this;
      return Utils.isBetween(p.x, this.xToScreen(xStart), this.xToScreen(xEnd))
        && Utils.isBetween(p.y, this.yToScreen(yEnd), this.yToScreen(yStart));
    };
  }

  setCanvas(id) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
  }

  drawImage(src, x, y, w, h, name) {
    const image = new Image();
    image.onload = () => this.ctx.drawImage(image, x, y, w, h);
    image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
    this.elements.push({
      left: x,
      top: y,
      width: w,
      height: h,
      element: image,
      name,
    });
  }

  draw() {
    this.drawLine(1, 1, 2, 2); // TESTING
  }


  // TODO:

  drawLine(x1, y1, x2, y2, useScreenCords = true) {
    // TESTING
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "red";

    const adjustedX1 = this.xToScreen(x1);
    const adjustedY1 = this.yToScreen(y1);

    const adjustedX2 = this.xToScreen(x2);
    const adjustedY2 = this.yToScreen(y2);

    this.ctx.moveTo(adjustedX1, adjustedY1);
    this.ctx.lineTo(adjustedX2, adjustedY2);
    this.ctx.stroke();
  }

  drawRect(x, y, width, height, useScreenCords = true) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(width, height);
    this.ctx.stroke();
  }

  fillRect(args) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(300, 150);
    this.ctx.stroke();
  }
}
