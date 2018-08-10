import _ from "lodash";
import Utils from "./utils";
import Layer from "./layer";
import GraphCalcs from "./graphCalcs";
import AxesProvider from "./axesProvider";
import GridProvider from "./gridProvider";
import GridLabelsProvider from "./gridLabelsProvider";

export default class GraphLayer extends Layer {
  constructor(view) {
    super(view);
    this.calcs = null;
  }

  draw() {
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
    if (!this.graph) { throw new Error("this.graph cannot be empty"); }
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
    const distances = !this.calls || !calcs.distances
      || (width !== calcs.width || height !== calcs.height)
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

    this.calcs = new GraphCalcs({
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
    });
    console.log(this.calcs);
    this.graph.calcs = this.calcs;
  }

  drawAxes() {
    const { ctx, calcs, graph } = this;

    const gridProv = new GridProvider({
      ctx,
      calcs,
      graph,
    });

    gridProv.draw({ isMajor: false });
    gridProv.draw({ axisDirection: "y", isMajor: false });
    gridProv.draw();
    gridProv.draw({ axisDirection: "y" });

    const axesProv = new AxesProvider({
      ctx,
      calcs,
    });
    axesProv.draw();

    const labelsProv = new GridLabelsProvider({
      ctx,
      calcs,
      graph,
    });
    labelsProv.draw();
  }
}
