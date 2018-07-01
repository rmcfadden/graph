import Layer from "./layer";
import ZoomInIcon from "./images/settings-20px.svg"

export default class View {
  constructor(graph) {
    this.graph = graph;

    this.layers = { "default" : new Layer(this) };    
    this.graph.canvasId = `canvas-${graph.id}`;
    this.adjustLayout();
    window.onresize = () => {
      this.adjustLayout();
      this.draw();
    }
  }

  adjustLayout() {
    let graphElement = document.getElementById(this.graph.id);    
    graphElement.innerHTML = `<canvas id='${this.graph.canvasId}'></canvas>`;

    // TODO: Currently only support full width
    let canvas = document.getElementById(this.graph.canvasId);   
    const pixelRatio = window.devicePixelRatio || 1;
    const realWidth = window.innerHeight > window.innerWidth ?
    Math.round(1.0 * window.innerWidth) :
    Math.round(1.0 * window.innerHeight);

    const width = Math.round(1.0 * window.innerWidth);
    const height  = Math.round(1.0 * window.innerHeight);

    graphElement.style.position = "relative";
    graphElement.style.width = width + "px";
    graphElement.style.height = height + "px";
    
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio; 

    /* DO I need this?
    #canvas-graph {
      display: block;
      width: 100%;
      height: 100%;
    */

  }

  draw() {
    Object.keys(this.layers).forEach( x => this.layers[x].draw());
  }
}