import Calcs from "./calcs";
import Utils from "./utils";


export default class Layer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
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

  // TODO:
  drawLine(args) {
  }

  drawLine(x, y, width, height, useScreenCords) {
    this.ctx.beginPath();
    this.ctx.moveTo(0,0);
    this.ctx.lineTo(300,150);
    this.ctx.stroke();
  }

  drawRect(args) {
    this.ctx.beginPath();
    this.ctx.moveTo(0,0);
    this.ctx.lineTo(300,150);
    this.ctx.stroke();  
  }

  fillRect(args) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(300, 150);
    this.ctx.stroke();
  }
}
