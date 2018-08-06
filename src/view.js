import GraphLayer from "./graphLayer";
import TopLayer from "./topLayer";

export default class View {
  constructor(graph) {
    this.graph = graph;
    this.layers = [];

    const graphLayer = new GraphLayer(this);
    graphLayer.name = "default";
    this.addLayer(graphLayer);

    const topLayer = new TopLayer(this);
    topLayer.name = "top";
    this.addLayer(topLayer);
    this.getSelectedLayer = () => this.layers.default; // default for now

    window.onresize = () => {
      this.adjustLayout();
      this.draw();
    };
    window.onorientationchange = window.onresize;

    this.adjustLayout();
    this.draw();
  }

  addLayer(layer) {
    const newLayer = layer;
    newLayer.index = this.layers.length;
    this.layers.push(newLayer);
    this.applyLayers();
  }

  applyLayers() {
    const graphElement = document.getElementById(this.graph.id);
    graphElement.style.position = "relative";

    const canvasHtml = this.layers
      .sort((a, b) => b.index - a.index)
      .reduce((acc, curr) => `${acc}<canvas id='canvas-${this.graph.id}-${curr.name}'`
        + ` style='position: absolute; left: 0; top: 0; z-index: ${curr.index + 1};'></canvas>`,
      "");

    graphElement.innerHTML = canvasHtml;
    this.layers.forEach(x => x.setCanvas(`canvas-${this.graph.id}-${x.name}`));
  }

  adjustLayout() {
    Object.keys(this.layers).forEach((x) => {
      const layer = this.layers[x];
      const { canvas } = layer;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  draw() {
    Object.keys(this.layers).forEach(x => this.layers[x].draw());
  }
}
