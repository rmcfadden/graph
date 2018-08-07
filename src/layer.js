export default class Layer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
  }

  setCanvas(id) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
  }
}
