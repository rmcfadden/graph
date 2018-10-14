import Calcs from "./calcs";
import Utils from "./utils";
import ElementProviderFactory from "./providers/elementProviderFactory";

export default class Layer {
  constructor(args) {
    this.name = args.name;
    this.view = args.view;
    this.graph = this.view.graph;
    this.calcs = new Calcs();
    this.useNativeTransform = args.useNativeTransform || false;
    this.scaleLineWidth = args.scaleLineWidth || true;
    this.factory = new ElementProviderFactory();
    
    this.xToScreen = x => this.calcs.xScreenScale * (x + this.calcs.xOffset);
    this.yToScreen = y => this.calcs.yScreenScale * (this.calcs.yOffset - y);
    this.screenToX = x => (x / this.calcs.xScreenScale) - this.calcs.xOffset;
    this.screenToY = y => this.calcs.yOffset - (y / this.calcs.yScreenScale);
    this.xScaleToScreen = x => x * this.calcs.xScreenScale;
    this.yScaleToScreen = y => y * this.calcs.yScreenScale;
    this.elements = [];
    this.images = {};
    this.transform = null;
    this.usingPath = false;
    this.isDirty = true;

    this.isInBounds = (p) => {
      const { xAxis, yAxis } = this;
      return Utils.isBetween(p.x, xAxis.start, xAxis.end)
        && Utils.isBetween(p.y, yAxis.start, yAxis.end);
    };

    this.setDirty = () => { this.isDirty = true; };

    this.isInScreenBounds = (p) => {
      const {
        xStart,
        xEnd,
        yStart,
        yEnd,
      } = this.calcs;
      return Utils.isBetween(p.x, this.xToScreen(xStart), this.xToScreen(xEnd))
        && Utils.isBetween(p.y, this.yToScreen(yEnd), this.yToScreen(yStart));
    };
  }

  setCanvasContext(canvas, ctx) {
    const { config } = this.graph;

    this.canvas = canvas;
    this.ctx = ctx;

    if (this.useNativeTransform) {
      this.transform = config.transform;
    }
  }

  get lineWidth() { return this.ctx.lineWidth; }

  set lineWidth(lineWidth) { this.ctx.lineWidth = lineWidth; }

  get strokeStyle() { return this.ctx.strokeStyle; }

  set strokeStyle(strokeStyle) { this.ctx.strokeStyle = strokeStyle; }

  get fillStyle() { return this.ctx.fillStyle; }

  set fillStyle(fillStyle) { this.ctx.fillStyle = fillStyle; }

  get font() { return this.ctx.font; }

  set font(font) { this.ctx.font = font; }

  layout() {
  }

  load() {
    Object.keys(this.factory.providers).forEach((p) => {
      const addFunctionName = `add${p}`;
      this[addFunctionName] = args => this.addElement({ type: p, ...args });
    });
  }
  
  draw() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    if (this.useNativeTransform) {
      const { xScreenScale, yScreenScale, xOffset, yOffset } = this.calcs;
      this.ctx.setTransform(xScreenScale,
        0,
        0,
        -1 * yScreenScale,
        xOffset * xScreenScale,
        (yOffset * yScreenScale));
    }

    this.elements.forEach((element) => {
      const elementProvider = this.factory.create(element.type);
      if (!elementProvider) { throw Error(`Element provider ${element.type} not found`); }
      elementProvider.draw({ layer: this, ...element });
    });
  }

  getAdjustedWidth() {
    const { xScreenScale, yScreenScale } = this.calcs;
    return Math.sqrt(xScreenScale ** 2, yScreenScale ** 2);
  }

  startPath() {
    this.usingPath = true;
  }

  stroke() {
    this.ctx.stroke();
    this.usingPath = false;
  }

  fill() {
    this.ctx.fill();
    this.usingPath = false;
  }

  addElement(args) {
    const options = {
      lineWidth: args.lineWidth !== undefined || this.lineWidth,
      scaleLineWidth: args.scaleLineWidth !== undefined ? args.scaleLineWidth
        : this.scaleLineWidth,
      strokeStyle: args.strokeStyle !== undefined || this.strokeStyle,
      fillStyle: args.fillStyle !== undefined || this.fillStyle,
      font: args.font !== undefined || this.font,
      stroke: args.stroke || true,
      fill: args.fill,
    };

    const element = {
      name: args.name,
      type: args.type,
      options,
      ...args,
    };
    this.elements.push(element);
    return element;
  }

  applyOptions(options) {
    const {
      lineWidth,
      scaleLineWidth,
      strokeStyle,
      fillStyle,
      font,
    } = options;
    // TODO: figure out lineWidth scaling
    const currentLineWidth = lineWidth || this.lineWidth;
    const currentScaleLineWidth = scaleLineWidth !== undefined ? 
      scaleLineWidth : this.scaleLineWidth;
    this.ctx.lineWidth = currentScaleLineWidth ? currentLineWidth / this.getAdjustedWidth()
      : currentLineWidth;

    this.ctx.strokeStyle = strokeStyle || this.strokeStyle;
    this.ctx.fillStyle = fillStyle || this.fillStyle;
    this.ctx.font = font || this.font;
  }

  getAdjustedPointDimension(x, y, width, height) {
    return {
      aX: !this.useNativeTransform ? this.xToScreen(x) : x,
      aY: !this.useNativeTransform ? this.yToScreen(y) : y,
      aWidth: !this.useNativeTransform ? this.xScaleToScreen(width) : width,
      aHeight: !this.useNativeTransform ? this.yScaleToScreen(height) : height,
    };
  }

  getAdjustedPoint(x, y) {
    return {
      aX: !this.useNativeTransform ? this.xToScreen(x) : x,
      aY: !this.useNativeTransform ? this.yToScreen(y) : y,
    };
  }
}
