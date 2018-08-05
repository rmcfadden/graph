import GraphLayer from "./graphLayer";
import TopLayer from "./topLayer";

export default class View {
  constructor(graph) {
    this.graph = graph;
    this.layers = {};

    this.graph.canvasId = `canvas-${graph.id}`;
    const graphElement = document.getElementById(this.graph.id);
    graphElement.style.position = "relative";
    graphElement.innerHTML = `<canvas id='canvas-${graph.id}-top' style='position: absolute; left: 0; top: 0; z-index: 2;'></canvas>`
      + `<canvas id='canvas-${graph.id}' style='position: absolute; left: 0; top: 0; z-index: 1;'></canvas>`;

    const graphLayer = new GraphLayer(this);
    graphLayer.name = "default";
    this.addLayer(graphLayer)

    const topLayer = new TopLayer(this);
    topLayer.name = "top";
    this.addLayer(topLayer)
    
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
    layer.index = this.layers.length;
    this.layers[layer.name] = layer;
  }

  applyLayers () {

  }

  adjustLayout() {    
    Object.keys(this.layers).forEach(x => {
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
