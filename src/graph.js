import Layer from "./layer";
import Config from "./config";
import View from "./view";

export default class Graph {
  constructor(args) {
    if(!args) { throw new Error("args must be defined"); }
    if(!args.id) { throw new Error("args.id must be defined"); }        
    this.id = args.id;
    this.canvasId = `canvas-${this.id}`;
    this.layers = { "default" : new Layer(this) };
    this.config = new Config();  

    let element = document.getElementById(args.id);
    element.innerHTML = `<canvas id='${this.canvasId}'></canvas>`;

    this.draw();
  }

  draw() {
    Object.keys(this.layers).forEach( x => this.layers[x].draw());
  }
};
