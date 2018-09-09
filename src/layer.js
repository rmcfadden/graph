import Calcs from "./calcs";
import Utils from "./utils";

export default class Layer {
  constructor(args) {
    this.name = args.name;
    this.view = args.view;
    this.graph = this.view.graph;
    this.calcs = new Calcs();
    this.useNativeTransform = args.useNativeTransform || false;
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
      const { xScreenScale, yScreenScale, xOffset, yDistance, yOffset, yMid,yEnd } = this.calcs;
      this.ctx.setTransform(xScreenScale,
        0,
        0,
        -1 * yScreenScale,
        xOffset * xScreenScale,
        (yOffset * yScreenScale));
    }
    
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
      if (element.type === "arc") {
        this.drawArc(element);
      }
      if (element.type === "text") {
        this.drawText(element);
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
    return this.addElement({ type: "rect", ...args });
  }

  addArc(args) {
    return this.addElement({ type: "arc", ...args });
  }

  addImage(args) {
    return this.addElement({ type: "image", ...args });
  }

  addElement(args) {
    const element = {
      type: args.type,
      strokeStyle: args.strokeStyle || this.strokeStyle,
      fillStyle: args.fillStyle || this.fillStyle,
      lineWidth: args.lineWidth || this.lineWidth,
      ...args,
    };
    this.elements.push(element);
    return element;
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
  } = {}) {
    const {
      adjustedX,
      adjustedY,
      adjustedWidth,
      adjustedHeight,
    } = this.getAdjustedPointDimension(x, y, width, height);

    if (!this.usingPath) {
      this.ctx.beginPath();
      this.lineWidth = (lineWidth || this.lineWidth) / this.getAdjustedWidth();
      this.strokeStyle = strokeStyle || this.strokeStyle;
      this.fillStyle = fillStyle || this.fillStyle;
    }
    
    this.ctx.rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

    if (!this.usingPath && stroke) {
      this.ctx.stroke();
    }
    if (!this.usingPath && fill) {
      this.ctx.fill();
    }
  }

  drawArc({
    x,
    y,
    r,
    sAngle,
    eAngle,
    counterclockwise = false,
    lineWidth,
    strokeStyle,
    fillStyle,
    stroke = true,
    fill = false,
  } = {}) {
    const {
      adjustedX,
      adjustedY,
    } = this.getAdjustedPoint(x, y);

    if (!this.usingPath) {
      this.ctx.beginPath();
      this.lineWidth = (lineWidth || this.lineWidth) / this.getAdjustedWidth();
      this.strokeStyle = strokeStyle || this.strokeStyle;
      this.fillStyle = fillStyle || this.fillStyle;
    }

    this.arcImproved(adjustedX, adjustedY, r, sAngle, eAngle, counterclockwise);

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
    font = "64px Arial",
    strokeStyle,
    fillStyle,
    stroke = false,
    fill = true,
  } = {}) {
 
    const lastUseNativeTransform = this.useNativeTransform;
    this.useNativeTransform = false;
    const {
      adjustedX,
      adjustedY,
    } = this.getAdjustedPoint(x, y);

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.strokeStyle = strokeStyle || this.strokeStyle;
    this.fillStyle = fillStyle || this.fillStyle;
    this.ctx.font = font || this.font;

    if (stroke) {
      this.ctx.strokeText(text, adjustedX, adjustedY);
    }
    if (fill) {
      this.ctx.fillText(text, adjustedX, adjustedY);
    }
    this.ctx.restore();
    this.useNativeTransform = lastUseNativeTransform;
  }


  drawImage({
    src,
    x,
    y,
    width,
    height,
  } = {}) {
    const cachedImage = this.images[src];
    if (!cachedImage) {
      const image = new Image();
      image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
      image.onload = () => this.ctx.drawImage(image, x, y, width, height);
      this.images[src] = image;
    } else {
      this.ctx.drawImage(cachedImage, x, y, width, height);
    }
  }

  drawLine({
    x1,
    y1,
    x2,
    y2,
    lineWidth,
    strokeStyle,
  } = {}) {
    const adjustedX1 = !this.useNativeTransform ? this.xToScreen(x1) : x1;
    const adjustedY1 = !this.useNativeTransform ? this.yToScreen(y1) : y1;
    const adjustedX2 = !this.useNativeTransform ? this.xToScreen(x2) : x2;
    const adjustedY2 = !this.useNativeTransform ? this.yToScreen(y2) : y2;

    if(!this.usingPath) {
      this.ctx.beginPath();
      this.lineWidth = (lineWidth || this.lineWidth) / this.getAdjustedWidth();
      this.strokeStyle = strokeStyle || this.strokeStyle;
    }

    this.ctx.moveTo(adjustedX1, adjustedY1);
    this.ctx.lineTo(adjustedX2, adjustedY2);
    
    if(!this.usingPath) {
      this.ctx.stroke();
    }
  }

  getAdjustedPointDimension(x, y, width, height) {
    return {
      adjustedX: !this.useNativeTransform ? this.xToScreen(x) : x,
      adjustedY: !this.useNativeTransform ? this.yToScreen(y) : y,
      adjustedWidth: !this.useNativeTransform ? this.xScaleToScreen(width) : width,
      adjustedHeight: !this.useNativeTransform ? this.yScaleToScreen(height) : height,
    };
  }

  getAdjustedPoint(x, y) {
    return {
      adjustedX: !this.useNativeTransform ? this.xToScreen(x) : x,
      adjustedY: !this.useNativeTransform ? this.yToScreen(y) : y,
    };
  }
  
  arcImproved(x, y, r) {
    const m = 0.551784;
  
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.scale(r, r)
  
    this.ctx.beginPath()
    this.ctx.moveTo(1, 0)
    this.ctx.bezierCurveTo(1,  -m,  m, -1,  0, -1)
    this.ctx.bezierCurveTo(-m, -1, -1, -m, -1,  0)
    this.ctx.bezierCurveTo(-1,  m, -m,  1,  0,  1)
    this.ctx.bezierCurveTo( m,  1,  1,  m,  1,  0)
    this.ctx.closePath()
    this.ctx.restore()
  }

}
