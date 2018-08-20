import Calcs from "./calcs";
import Utils from "./utils";

export default class Layer {
  constructor(args) {
    this.name = args.name;
    this.view = args.view;
    this.graph = this.view.graph;
    this.calcs = new Calcs();
    this.xToScreen = x => this.calcs.xScreenScale * (x + this.calcs.xOffset);
    this.yToScreen = y => this.calcs.yScreenScale * (this.calcs.yOffset - y);
    this.screenToX = x => (x / this.calcs.xScreenScale) - this.calcs.xOffset;
    this.screenToY = y => this.calcs.yOffset - (y / this.calcs.yScreenScale);
    this.xScaleToScreen = x => x * this.calcs.xScreenScale;
    this.yScaleToScreen = y => y * this.calcs.yScreenScale;
    this.elements = [];

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

  get lineWidth() { return this.ctx.lineWidth; }

  set lineWidth(lineWidth) { this.ctx.lineWidth = lineWidth; }

  get strokeStyle() { return this.ctx.strokeStyle; }

  set strokeStyle(strokeStyle) { this.ctx.strokeStyle = strokeStyle; }

  get fillStyle() { return this.ctx.fillStyle; }

  set fillStyle(fillStyle) { this.ctx.fillStyle = fillStyle; }

  layout() {
  }

  load() {
  }


  draw() {
    this.elements.forEach((element) => {
      if (element.type === "line") {
        this.drawLine(element);
      }
      if (element.type === "rect") {
        this.drawRect(element);
      }
      if (element.type === "image") {
        this.drawImage(element);
      }
    });
  }

  drawLine({
    x1, y1, x2, y2, lineWidth, strokeStyle, useScreenCords = true,
  } = {}) {
    const adjustedX1 = useScreenCords ? this.xToScreen(x1) : x1;
    const adjustedY1 = useScreenCords ? this.yToScreen(y1) : y1;
    const adjustedX2 = useScreenCords ? this.xToScreen(x2) : x2;
    const adjustedY2 = useScreenCords ? this.yToScreen(y2) : y2;

    this.ctx.beginPath();
    this.lineWidth = lineWidth || this.lineWidth;
    this.strokeStyle = strokeStyle || this.strokeStyle;
    this.ctx.moveTo(adjustedX1, adjustedY1);
    this.ctx.lineTo(adjustedX2, adjustedY2);
    this.ctx.stroke();
  }

  addLine(args) {
    const element = {
      type: "line",
      strokeStyle: args.strokeStyle || this.strokeStyle,
      lineWidth: args.lineWidth || this.lineWidth,
      useScreenCords: args.useScreenCords !== undefined || true,
      ...args,
    };
    this.elements.push(element);
  }

  addRect(args) {
    const element = {
      type: "rect",
      strokeStyle: args.strokeStyle || this.strokeStyle,
      fillStyle: args.fillStyle || this.fillStyle,
      lineWidth: args.lineWidth || this.lineWidth,
      useScreenCords: args.useScreenCords !== undefined || true,
      ...args,
    };
    this.elements.push(element);
  }

  drawRect({
    x,
    y,
    width,
    height,
    lineWidth,
    strokeStyle,
    fillStyle,
    stroke = true,
    fill = false,
    useScreenCords = true,
  } = {}) {
    const {
      adjustedX,
      adjustedY,
      adjustedWidth,
      adjustedHeight,
    } = this.getAdjustedPointDimension(x, y, width, height, useScreenCords);

    this.ctx.beginPath();
    this.lineWidth = lineWidth || this.lineWidth;
    this.strokeStyle = strokeStyle || this.strokeStyle;
    this.fillStyle = fillStyle || this.fillStyle;
    this.ctx.rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);
    if (stroke) {
      this.ctx.stroke();
    }
    if (fill) {
      this.ctx.fill();
    }
  }

  addImage(args) {
    const element = {
      type: "image",
      ...args,
    };
    this.elements.push(element);
  }

  drawImage({
    src,
    x,
    y,
    width,
    height,
    name,
  } = {}) {
    const image = new Image();
    image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
    image.onload = () => this.ctx.drawImage(image, x, y, width, height);    
  }

  getAdjustedPointDimension(x, y, width, height, useScreenCords) {
    return {
      adjustedX: useScreenCords ? this.xToScreen(x) : x,
      adjustedY: useScreenCords ? this.yToScreen(y) : y,
      adjustedWidth: useScreenCords ? this.xScaleToScreen(width) : width,
      adjustedHeight: useScreenCords ? this.yScaleToScreen(height) : height,
    };
  }

  getAdjustedPoint(x, y) {
    return {
      adjustedX: useScreenCords ? this.xToScreen(x) : x,
      adjustedY: useScreenCords ? this.yToScreen(y) : y,
    };
  }
}
