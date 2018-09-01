import lo from "lodash";
import GraphLayer from "./graphLayer";
import BackgroundLayer from "./backgroundLayer";
import TopLayer from "./topLayer";
import Layer from "./layer";
import Utils from "./utils";
import GraphCalcs from "./graphCalcs";

export default class View {
  constructor(graph) {
    this.graph = graph;
    this.layers = [];
    this.calcs = null;
    this.width = null;
    this.height = null;
    this.selectedLayer = null;

    const backgroundLayer = new BackgroundLayer({ view: this, name: "background" });
    this.addLayer(backgroundLayer);

    const graphLayer = new GraphLayer({ view: this, name: "graph" });
    this.addLayer(graphLayer);

    const contentLayer = new Layer({ view: this, name: "content" });
    this.addLayer(contentLayer);

    const topLayer = new TopLayer({ view: this, name: "top" });
    this.addLayer(topLayer);

    this.setSelectedLayer("content");

    window.onresize = () => {
      this.draw();
    };
    window.onorientationchange = window.onresize;

    this.createOffscreenCanvas = () => {
      const offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.width = this.width;
      offScreenCanvas.height = this.height;
      const context = offScreenCanvas.getContext("2d");
      context.fillStyle = 'orange'; //set fill color
      context.fillRect(10, 10, 200, 200);
      return offScreenCanvas;
    }

    this.copyToOnScreen = (offScreenCanvas) => {
      const onScreenContext = document.getElementById("onScreen").getContext("2d");
      onScreenContext.drawImage(offScreenCanvas, 0, 0);
    }
  }

  getSelectedLayer() {
    return this.selectedLayer;
  }

  setSelectedLayer(name) {
    const layer = this.layers.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!layer) { throw Error(`Cannot find layer ${name}`); }
    this.selectedLayer = layer;
  }

  addLayer(layer) {
    const newLayer = layer;
    newLayer.index = this.layers.length;
    this.layers.push(newLayer);
    this.applyLayers();
    newLayer.load();
  }

  applyLayers() {
    const graphElement = document.getElementById(this.graph.id);
    graphElement.style.position = "relative";

    const canvasHtml = this.layers
      .reduce((acc, curr) => `${acc}<canvas id='canvas-${this.graph.id}-${curr.name}'`
        + ` style='position: absolute; left: 0; top: 0; z-index: ${curr.index};'></canvas>`,
      "");

    graphElement.innerHTML = canvasHtml;
    this.layers.forEach(x => x.setCanvas(`canvas-${this.graph.id}-${x.name}`));
    this.layers.forEach(x => this.setLayerDimentions(x));
  }

  setLayerDimentions(layer) {
    const { canvas } = layer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  layout() {
    this.calcs = this.preCalculations();
    Object.keys(this.layers).forEach((x) => {
      const layer = this.layers[x];
      this.setLayerDimentions(layer);
      this.layers[x].calcs = this.calcs;
      this.layers[x].layout();
    });
  }

  draw() {
    this.layout();
    Object.keys(this.layers).forEach(x => this.layers[x].draw());
  }

  preCalculations() {
    if (!this.graph) { throw new Error("this.graph cannot be empty"); }
    const { config } = this.graph;
    const { calcs, width, height } = this;
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
    const distances = !this.calcs || !calcs.distances
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

    const xRangeMinor = lo.range(xStart, xEnd, xMinorStep);
    const yRangeMinor = lo.range(yStart, yEnd, yMinorStep);
    const xRangeMinorAdjusted = Utils.alignRange(xRangeMinor, xAxis.minorGrid.step);
    const yRangeMinorAdjusted = Utils.alignRange(yRangeMinor, yAxis.minorGrid.step);

    return new GraphCalcs({
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
  }
}
