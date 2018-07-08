import Utils from "./utils";

export default class Layer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
    this.canvas = this.view.canvas;
    this.ctx = this.view.ctx;
    this.calcs = {};
    this.xToScreen = x => this.calcs.xScale * (x + this.calcs.xOffset);
    this.yToScreen = y => this.calcs.yScale * (this.calcs.yOffset - y);
    this.screenToX = x => (x / this.calcs.xScale) - this.calcs.xOffset;
    this.screenToY = y => this.calcs.yOffset - (y / this.calcs.yScale);
    this.adjust = x => parseInt(x, 0);

    this.isInBounds = (p) => {
      const { xAxis, yAxis } = this.calcs;
      return Utils.isBetween(p.x, xAxis.start, xAxis.end)
        && Utils.isBetween(p.y, yAxis.start, yAxis.end);
    };

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

  draw() {
    if (!this.graph) { throw new Error("this.graph cannot be empty"); }
    if (!this.graph.canvasId) { throw new Error("this.graph.canvasId cannot be empty"); }
    this.preCalculations();
    this.drawBackground();
    this.drawAxes();
  }

  drawBackground() {
    const { backgroundStyle, borderStyle, borderWidth } = this.graph.config;
    const { width, height } = this.canvas;
    const { ctx } = this;

    ctx.fillStyle = backgroundStyle;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = borderStyle;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, width, height);
  }

  preCalculations() {
    const { config } = this.graph;
    const { width, height } = this.canvas;
    const { x: xAxis, y: yAxis } = config.axes;

    const xStart = xAxis.getAdjustedStart();
    const xEnd = xAxis.getAdjustedEnd();
    const yStart = yAxis.getAdjustedStart();
    const yEnd = yAxis.getAdjustedEnd();

    const xDistance = Utils.distance(xStart, xEnd);
    const xMid = xDistance / 2;
    const yDistance = Utils.distance(yStart, yEnd);
    const yMid = yDistance / 2;
    const xScale = width / xDistance;
    const yScale = height / yDistance;
    const xOffset = xDistance - xEnd;
    const yOffset = yDistance + yStart;

    const xRange = Utils.range(xStart, xEnd, xAxis.majorGrid.step);
    const yRange = Utils.range(yStart, yEnd, yAxis.majorGrid.step);
    const xRangeAdjusted = Utils.offsetRangeToClosest(xRange, 0);
    const yRangeAdjusted = Utils.offsetRangeToClosest(yRange, 0);
    
console.log(xRange);
console.log(`closestTo: ${Utils.closestTo(xRange, 0)}`);
console.log(`xStart: ${xStart}`);
console.log(`xEnd: ${xEnd}`);
console.log(xRangeAdjusted);

    const xRangeMinor = Utils.range(xStart, xEnd, xAxis.minorGrid.step);
    const yRangeMinor = Utils.range(yStart, yEnd, yAxis.minorGrid.step);
    const xRangeMinorAdjusted = Utils.offsetRangeToClosest(xRangeMinor, 0);
    const yRangeMinorAdjusted = Utils.offsetRangeToClosest(yRangeMinor, 0);

    this.calcs = {
      width,
      height,
      xAxis,
      yAxis,
      xDistance,
      yDistance,
      xMid,
      yMid,
      xOffset,
      yOffset,
      xScale,
      yScale,
      xRange,
      yRange,
      xStart,
      xEnd,
      yStart,
      yEnd,
      xRangeAdjusted,
      yRangeAdjusted,
      xRangeMinor,
      yRangeMinor,
      xRangeMinorAdjusted,
      yRangeMinorAdjusted,
    };
  }

  drawAxes() {
    const { config } = this.graph;
    const { ctx } = this;
    const {
      xAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = this.calcs;

    ctx.lineWidth = xAxis.width;

    // Draw gridlines/rulers
    this.drawGrid({ isMajor: false });
    this.drawGrid({ axisDirection: "y", isMajor: false });

    this.drawGrid();
    this.drawGrid({ axisDirection: "y" });

    // Draw origin
    ctx.beginPath();
    ctx.strokeStyle = xAxis.style || config.borderStyle;
    ctx.lineWidth = 1;

    ctx.moveTo(this.adjust(this.xToScreen(xStart)), this.adjust(this.yToScreen(0)));
    ctx.lineTo(this.adjust(this.xToScreen(xEnd)), this.adjust(this.yToScreen(0)));
    ctx.moveTo(this.adjust(this.xToScreen(0)), this.adjust(this.yToScreen(yStart)));
    ctx.lineTo(this.adjust(this.xToScreen(0)), this.adjust(this.yToScreen(yEnd)));
    ctx.stroke();
  }

  drawGrid({
    axisDirection = "x",
    isMajor = true,
  } = {}) {
    const { config } = this.graph;
    const { ctx } = this;
    const {
      xRangeAdjusted,
      yRangeAdjusted,
      xRangeMinorAdjusted,
      yRangeMinorAdjusted,
      xAxis,
      yAxis,
    } = this.calcs;

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ? xAxis : yAxis;
    const secondAxis = isXAxis ? yAxis : xAxis;
    const grid = isMajor ? axis.majorGrid : axis.minorGrid;
    const { textHeight } = grid;

    if (grid.show) {
      let range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;
      if (!isXAxis) {
        range = isMajor ? yRangeAdjusted : yRangeMinorAdjusted;
      }

      const toScreen = isXAxis ? this.yToScreen : this.xToScreen;
      const rulerLength = textHeight / ((isMajor) ? 2.0 : 4.0);

      ctx.beginPath();
      ctx.strokeStyle = grid.style || config.borderStyle;
      ctx.lineWidth = 1;

      range.forEach((p) => {
        const fixed = isXAxis ? this.xToScreen(p) : this.yToScreen(p);
        const gridType = "grid";
        const start = (grid.type === gridType) ? toScreen(secondAxis.getAdjustedStart())
          : -1 * rulerLength;
        const end = (grid.type === gridType) ? toScreen(secondAxis.getAdjustedEnd())
          : rulerLength;

        const xStart = isXAxis ? fixed : start;
        const xEnd = isXAxis ? fixed : end;
        const yStart = isXAxis ? start : fixed;
        const yEnd = isXAxis ? end : fixed;

        ctx.moveTo(this.adjust(xStart), this.adjust(yStart));
        ctx.lineTo(this.adjust(xEnd), this.adjust(yEnd));
      });
      ctx.stroke();

      // Draw horizontal labels
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      // let previousX = null;
      const mod = 1;

      range.forEach((p, i) => {
        const dashWidth = ctx.measureText("-").width / 2.0;
        if ((i % mod) !== 0) { return; }
        if (grid.showLabels) {
          if (isXAxis) {
            const textMetrics = ctx.measureText(p);
            let xTextOffset = (textMetrics.width / 2.0);
            if (p < 0) {
              xTextOffset += dashWidth;
            }

            if (p === 0) {
              xTextOffset += (textHeight / 2.0);
            }

            const yTextOffset = -1 * textHeight;
            ctx.lineWidth = 4; // StrokeWidth
            ctx.font = `${textHeight}px Arial`;

            const currentX = this.xToScreen(p) - xTextOffset;
            const currentY = this.yToScreen(0) - yTextOffset;

            if (this.isInScreenBounds({ x: currentX, y: currentY })
              && this.isInScreenBounds({ x: this.xToScreen(p) + xTextOffset, y: currentY })) {
              const pFormatted = grid.labelFormatter ? grid.labelFormatter(p) : p;
              ctx.strokeText(pFormatted, currentX, currentY);
              ctx.fillText(pFormatted, currentX, currentY);
            }
            // previousX = currentX;
          }
        }
      });
    }
  }
}
