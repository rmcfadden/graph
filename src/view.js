import GraphLayer from "./graphLayer";
import TopLayer from "./topLayer";

export default class View {
  constructor(graph) {
    this.graph = graph;

    this.graph.canvasId = `canvas-${graph.id}`;
    const graphElement = document.getElementById(this.graph.id);
    graphElement.style.position = "relative";
    graphElement.innerHTML = `<canvas id='${this.graph.canvasId}-top' style='position: absolute; left: 0; top: 0; z-index: 2;'></canvas>`
      + `<canvas id='${this.graph.canvasId}' style='position: absolute; left: 0; top: 0; z-index: 1;'></canvas>`;
 
    this.layers = { 
      default: new GraphLayer(this),
      top: new TopLayer(this),
    };
 
    this.getSelectedLayer = () => this.layers.default; // default for now

    window.onorientationchange = window.onresize;
    window.onresize = () => {
      this.adjustLayout();
      this.draw();
    };

    this.adjustLayout();
    this.draw();
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
