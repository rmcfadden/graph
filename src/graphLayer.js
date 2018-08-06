import _ from "lodash";
import Utils from "./utils";
import labelFormatter from "./labelFormatter";

export default class GraphLayer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;

    this.calcs = {};
    this.xToScreen = x => this.calcs.xScreenScale * (x + this.calcs.xOffset);
    this.yToScreen = y => this.calcs.yScreenScale * (this.calcs.yOffset - y);
    this.screenToX = x => (x / this.calcs.xScreenScale) - this.calcs.xOffset;
    this.screenToY = y => this.calcs.yOffset - (y / this.calcs.yScreenScale);
    this.adjust = (x, lineWidth) => {
      const i = parseInt(x, 0);
      return lineWidth % 2 === 1 || lineWidth < 1.0 ? i + 0.5 : i;
    };

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

  setCanvas(id) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
  }

  draw() {
    if (!this.graph) { throw new Error("this.graph cannot be empty"); }
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
    const { calcs } = this;
    const { width, height } = this.canvas;
    const { x: xAxis, y: yAxis } = config.axes;
    const { transform } = config;
    const { xScale, yScale } = transform;

    const {
      x: xStart,
      y: yStart,
    } = Utils.applyTansform({ x: xAxis.start, y: yAxis.start }, transform);

    const {
      x: xEnd,
      y: yEnd,
    } = Utils.applyTansform({ x: xAxis.end, y: yAxis.end }, transform);

    const xDistance = Utils.distance(xStart, xEnd);
    const yDistance = Utils.distance(yStart, yEnd);
    const { useAutoGrid, autoGrid } = config;
    const distances = !calcs.distances || (width !== calcs.width || height !== calcs.height)
      ? autoGrid.getDistances() : calcs.distances;

    const applyAutoGrid = useAutoGrid && distances && distances.length > 0;
    if (applyAutoGrid) {
      const scaledXDistances = distances.map(x => xDistance / x.majorStep);
      const scaledYDistances = distances.map(x => yDistance / x.majorStep);
      const gridCellLength = 120;
      const xGridLines = Math.floor(width / gridCellLength);
      const yGridLines = Math.floor(height / gridCellLength);
      const closestXIndex = Utils.closestIndex(scaledXDistances, xGridLines);
      const closestYIndex = Utils.closestIndex(scaledYDistances, yGridLines);

      const xGridConfig = distances[closestXIndex];
      const yGridConfig = distances[closestYIndex];
      xAxis.majorGrid.step = xGridConfig.majorStep;
      xAxis.minorGrid.step = xGridConfig.minorStep;
      yAxis.majorGrid.step = yGridConfig.majorStep;
      yAxis.minorGrid.step = yGridConfig.minorStep;
    }

    const xScreenScale = width / xDistance;
    const yScreenScale = height / yDistance;
    const xOffset = xDistance - xEnd;
    const yOffset = yDistance + yStart;
    const xMid = xStart + (xDistance / 2.0);
    const yMid = yStart + (yDistance / 2.0);
    const xMajorStep = xAxis.majorGrid.step * (applyAutoGrid ? 1 : xScale);
    const yMajorStep = yAxis.majorGrid.step * (applyAutoGrid ? 1 : xScale);
    const xMinorStep = xAxis.minorGrid.step * (applyAutoGrid ? 1 : yScale);
    const yMinorStep = yAxis.minorGrid.step * (applyAutoGrid ? 1 : yScale);

    const xRange = Utils.range(xStart, xEnd, xMajorStep);
    const yRange = Utils.range(yStart, yEnd, yMajorStep);
    const xRangeAdjusted = Utils.alignRange(xRange, xMajorStep);
    const yRangeAdjusted = Utils.alignRange(yRange, yMajorStep);

    const xRangeMinor = _.range(xStart, xEnd, xMinorStep);
    const yRangeMinor = _.range(yStart, yEnd, yMinorStep);
    const xRangeMinorAdjusted = Utils.alignRange(xRangeMinor, xAxis.minorGrid.step);
    const yRangeMinorAdjusted = Utils.alignRange(yRangeMinor, yAxis.minorGrid.step);

    this.calcs = {
      width,
      height,
      xAxis,
      yAxis,
      xMid,
      yMid,
      xDistance,
      yDistance,
      xOffset,
      yOffset,
      xScreenScale,
      yScreenScale,
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
      xMajorStep,
      yMajorStep,
      xMinorStep,
      yMinorStep,
      distances,
    };
    this.graph.calcs = this.calcs;
  }

  drawAxes() {
    const { ctx } = this;
    const {
      xAxis,
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = this.calcs;
    
    ctx.lineWidth = xAxis.width;

    // Draw minor gridlines
    this.drawGrid({ isMajor: false });
    this.drawGrid({ axisDirection: "y", isMajor: false });

    // Draw major gridlines
    this.drawGrid();
    this.drawGrid({ axisDirection: "y" });

    // Grid
    ctx.beginPath();

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(this.adjust(this.xToScreen(xStart), lineWidth),
        this.adjust(this.yToScreen(0), lineWidth));
      ctx.lineTo(this.adjust(this.xToScreen(xEnd), lineWidth),
        this.adjust(this.yToScreen(0), lineWidth));
    }

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(this.adjust(this.xToScreen(0), lineWidth),
        this.adjust(this.yToScreen(yStart), lineWidth));
      ctx.lineTo(this.adjust(this.xToScreen(0), lineWidth),
        this.adjust(this.yToScreen(yEnd), lineWidth));
    }

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
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = this.calcs;

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ? xAxis : yAxis;
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
      ctx.strokeStyle = grid.style;
      ctx.lineWidth = grid.width;

      const axisStart = isXAxis ? yStart : xStart;
      const axisEnd = isXAxis ? yEnd : xEnd;

      range.forEach((p) => {
        const fixed = isXAxis ? this.xToScreen(p) : this.yToScreen(p);
        const gridType = "grid";
        const start = (grid.type === gridType) ? toScreen(axisStart)
          : -1 * rulerLength;
        const end = (grid.type === gridType) ? toScreen(axisEnd)
          : rulerLength;
        const xStartLine = isXAxis ? fixed : start;
        const xEndLine = isXAxis ? fixed : end;
        const yStartLine = isXAxis ? start : fixed;
        const yEndLine = isXAxis ? end : fixed;
        const { lineWidth } = ctx;
        ctx.moveTo(this.adjust(xStartLine, lineWidth), this.adjust(yStartLine, lineWidth));
        ctx.lineTo(this.adjust(xEndLine, lineWidth), this.adjust(yEndLine, lineWidth));
      });
      ctx.stroke();

      // Draw horizontal labels
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const dashWidth = ctx.measureText("-").width / 2.0;

      // TODO: remove labels if they overlap
      const mod = 1;
      range.forEach((p, i) => {
        if ((i % mod) !== 0) { return; }
        if (grid.showLabels) {
          if (isXAxis) {
            const labelFormat = labelFormatter.format;
            const pFormatted = labelFormat ? labelFormat(p) : p;
            const textMetrics = ctx.measureText(pFormatted);
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

            let currentX = this.xToScreen(p) - xTextOffset;
            const currentY = this.yToScreen(0) - yTextOffset;

            let isInScreenBounds = this.isInScreenBounds({ x: currentX, y: currentY })
              && this.isInScreenBounds({ x: this.xToScreen(p) + xTextOffset, y: currentY });
            if (i === 0 && !isInScreenBounds) {
              currentX += xTextOffset + dashWidth;
              isInScreenBounds = true;
            }

            if (i === range.length) {
              currentX -= xTextOffset;
              isInScreenBounds = true;
            }

            if (isInScreenBounds) {
              ctx.strokeText(pFormatted, currentX, currentY);
              ctx.fillText(pFormatted, currentX, currentY);
            }
          }
        }
      });
    }
  }
}
