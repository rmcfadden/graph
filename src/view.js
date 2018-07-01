import ZoomInIcon from "./images/settings-20px.svg"

export default class View {
  constructor(args) {
    this.layers = { "default" : new Layer(this) };

    this.canvasId = `canvas-${this.id}`;
    let element = document.getElementById(args.id);
    
    element.innerHTML = `<canvas id='${this.canvasId}'></canvas>`;
  }

  draw() {
    Object.keys(this.layers).forEach( x => this.layers[x].draw());
  }
}