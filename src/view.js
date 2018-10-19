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

    this.createOffScreenCanvasContext = () => {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext("2d");
      return { canvas, ctx };
    };

    this.copyCanvasToOnScreenCanvas = (layer) => {
      const { canvasName, canvas: offScreenCanvas } = layer;
      const canvas = document.getElementById(canvasName);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(offScreenCanvas, 0, 0);
      layer.setCanvasContext(canvas, ctx);
    };

    this.getCanvasName = (id, name) => `canvas-${id}-${name}`;

    const backgroundLayer = new BackgroundLayer({ view: this, name: "background" });
    this.addLayer(backgroundLayer);

    const graphLayer = new GraphLayer({ view: this, name: "graph" });
    this.addLayer(graphLayer);

    const contentLayer = new Layer({ view: this, name: "content", useNativeTransform: true });
    this.addLayer(contentLayer);

    const topLayer = new TopLayer({ view: this, name: "top" });
    this.addLayer(topLayer);

    this.setSelectedLayer("content");

    window.onresize = () => {
      this.layers.forEach(l => l.setDirty());
      this.draw();
    };
    window.onorientationchange = window.onresize;
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
    const { id } = this.graph;
    const newLayer = layer;
    newLayer.index = this.layers.length;
    newLayer.canvasName = this.getCanvasName(id, newLayer.name);
    this.layers.push(newLayer);
    this.applyLayers();
    newLayer.load();
  }

  applyLayers() {
    const { id, config } = this.graph;
    const { drawOffScreen } = config;

    const graphElement = document.getElementById(id);
    graphElement.style.position = "relative";
    const canvasHtml = this.layers
      .reduce((acc, curr) => `${acc}<canvas id='${this.getCanvasName(id, curr.name)}'`
        + ` width='${this.width}' height='${this.height}'`
        + ` style='position: absolute; top:0; left:0; z-index:${curr.index};'></canvas>`,
      "");
    graphElement.innerHTML = canvasHtml;

    this.layers.forEach((l) => {
      if (drawOffScreen) {
        const { canvas, ctx } = this.createOffScreenCanvasContext();
        l.setCanvasContext(canvas, ctx);
      } else {
        const canvas = document.getElementById(l.canvasName);
        const ctx = canvas.getContext("2d");
        l.setCanvasContext(canvas, ctx);
      }
      this.setLayerDimentions(l);
    });
  }

  setLayerDimentions(layer) {
    const { canvas } = layer;
    const { config } = this.graph;
    const { drawOffScreen } = config;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (layer.isDirty) {
      canvas.width = this.width;
      canvas.height = this.height;

      if (drawOffScreen) {
        const onScreenCanvas = document.getElementById(layer.canvasName);
        onScreenCanvas.width = this.width;
        onScreenCanvas.height = this.height;
      }
    }
  }

  layout() {
    this.calcs = this.preCalculations();
console.log(this.calcs);
    this.layers.forEach((l) => {
      this.setLayerDimentions(l);
      l.calcs = this.calcs;
      if (l.isDirty) {
        l.layout();
      }
    });
  }

  draw() {
    const { config } = this.graph;
    const { drawOffScreen } = config;
    this.layout();

    this.layers.filter(l => l.isDirty).forEach((l) => {
      l.draw();
      if (drawOffScreen) {
        this.copyCanvasToOnScreenCanvas(l);
      }
    });
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
      const gridCellLength = 160; // TODO: move to config
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
