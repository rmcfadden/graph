import Layer from "./layer";
import Config from "./config";

export default class Graph {
  constructor(args) {
    this.id = args.id;
    this.layers = { "default" : new Layer(this) };
    this.config = new Config();
  }

  draw() {
    Object.keys(this.layers).forEach( x => this.layers[x].draw());
  }
};
