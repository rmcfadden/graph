import Axis from "./axis";

export default class Config {
  constructor(args) {
    this.title = "";
    this.borderStyle = "black";
    this.borderWidth = 1;
    this.backgroundStyle = "white";
    this.axes = { 
      "x" : new Axis(), 
      "y" : new Axis()
    };
  }
}