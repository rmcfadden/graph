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

    const factory = new ElementProviderFactory();

    this.elements.forEach((element) => {
      if (element.type === "line") {
        this.drawLine(element);
      }
      if (element.type === "rectangle") {
        factory.create(element.type).draw({ layer: this, ...element });
      }
      if (element.type === "image") {
        factory.create(element.type).draw({ layer: this, ...element });
      }
      if (element.type === "arc") {
        this.drawArc(element);
      }
      if (element.type === "text") {
        this.drawText(element);
      }
      if (element.type === "beziercurve") {
        this.drawBezierCurve(element);
      }
      if (element.type === "quadraticcurve") {
        this.drawQuadraticCurve(element);
      }
      if (element.type === "quadraticspline") {
        this.drawQuadraticOrLinearSpline(element);
      }
      if (element.type === "linearspline") {
        this.drawQuadraticOrLinearSpline({ type: "linear", ...element });
      }
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

  addText(args) {
    return this.addElement({ type: "text", ...args });
  }

  addLine(args) {
    return this.addElement({ type: "line", ...args });
  }

  addRect(args) {
    return this.addElement({ type: "rectangle", ...args });
  }

  addArc(args) {
    return this.addElement({ type: "arc", ...args });
  }

  addImage(args) {
    return this.addElement({ type: "image", ...args });
  }

  addBezierCurve(args) {
    return this.addElement({ type: "beziercurve", ...args });
  }

  addQuadraticCurve(args) {
    return this.addElement({ type: "quadraticcurve", ...args });
  }

  addQuadraticSpline(args) {
    return this.addElement({ type: "quadraticspline", ...args });
  }

  addLinearSpline(args) {
    return this.addElement({ type: "linearspline", ...args });
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
    const currentScaleLineWidth = scaleLineWidth !== undefined ? scaleLineWidth : this.scaleLineWidth;
    this.ctx.lineWidth = currentScaleLineWidth ? currentLineWidth / this.getAdjustedWidth()
      : currentLineWidth;

    this.ctx.strokeStyle = strokeStyle || this.strokeStyle;
    this.ctx.fillStyle = fillStyle || this.fillStyle;
    this.ctx.font = font || this.font;
  }

  drawArc({
    x,
    y,
    r,
    sAngle,
    eAngle,
    counterclockwise = false,
    options = {},
  } = {}) {
    const { stroke, fill } = options;
    const {
      aX,
      aY,
    } = this.getAdjustedPoint(x, y);

    if (!this.usingPath) {
      this.ctx.beginPath();
      this.applyOptions(options);
    }

    this.ctx.arc(aX, aY, r, sAngle, eAngle, counterclockwise);

    if (!this.usingPath && stroke) {
      this.ctx.stroke();
    }
    if (!this.usingPath && fill) {
      this.ctx.fill();
    }
  }

  drawText({
    x,
    y,
    text,
    options = {
      fill: true,
    },
  } = {}) {
    const { stroke, fill } = options;
    const lastUseNativeTransform = this.useNativeTransform;
    this.useNativeTransform = false;
    const {
      aX,
      aY,
    } = this.getAdjustedPoint(x, y);

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.applyOptions(options);

    if (stroke) {
      this.ctx.strokeText(text, aX, aY);
    }
    if (fill !== false) {
      this.ctx.fillText(text, aX, aY);
    }
    this.ctx.restore();
    this.useNativeTransform = lastUseNativeTransform;
  }


  drawLine({
    x1,
    y1,
    x2,
    y2,
    options = {},
  } = {}) {
    const aX1 = !this.useNativeTransform ? this.xToScreen(x1) : x1;
    const aY1 = !this.useNativeTransform ? this.yToScreen(y1) : y1;
    const aX2 = !this.useNativeTransform ? this.xToScreen(x2) : x2;
    const aY2 = !this.useNativeTransform ? this.yToScreen(y2) : y2;

    if (!this.usingPath) {
      this.ctx.beginPath();
      this.applyOptions(options);
    }

    this.ctx.moveTo(aX1, aY1);
    this.ctx.lineTo(aX2, aY2);

    if (!this.usingPath) {
      this.ctx.stroke();
    }
  }

  drawBezierCurve({
    x,
    y,
    options = {},
  } = {}) {
    const { stroke, fill } = options;
    const {
      aX,
      aY,
    } = this.getAdjustedPoint(x, y);

    if (!this.usingPath) {
      this.ctx.beginPath();
      this.applyOptions(options);
    }

    // TODO

    if (!this.usingPath && stroke) {
      this.ctx.stroke();
    }
    if (!this.usingPath && fill) {
      this.ctx.fill();
    }
  }

  drawQuadraticOrLinearSpline({
    points,
    curveType = "quadratic",
    options = {},
  } = {}) {
    const { stroke, fill } = options;
    if (!this.usingPath) {
      this.ctx.beginPath();
      this.applyOptions(options);
    }

    const { aX, aY } = this.getAdjustedPoint(points[0].x, points[0].y);
    this.ctx.moveTo(aX, aY);

    let i = 1;
    for (; i < points.length - 1; i += 1) {
      const { aX: aX1, aY: aY1 } = this.getAdjustedPoint(points[i].x, points[i].y);
      const { aX: aX2, aY: aY2 } = this.getAdjustedPoint(points[i + 1].x, points[i + 1].y);
      const xc = (aX1 + aX2) / 2;
      const yc = (aY1 + aY2) / 2;

      const curveName = (curveType === "quadratic") ? "quadraticCurveTo" : "lineTo";
      this.ctx[curveName](aX1, aY1, xc, yc);
    }

    if (!this.usingPath && stroke) {
      this.ctx.stroke();
    }
    if (!this.usingPath && fill) {
      this.ctx.fill();
    }
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
