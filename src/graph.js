import Config from "./config";
import View from "./view";

export default class Graph {
  constructor(args) {
    if(!args) { throw new Error("args must be defined"); }
    if(!args.id) { throw new Error("args.id must be defined"); }        
    this.id = args.id;
    this.config = new Config();

    this.view = new View(this);
    this.draw();
  }

  draw() {
    this.view.draw();
  }
}
