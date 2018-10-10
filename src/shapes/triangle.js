import Shape from "./shape";

export default class Arrowhead extends Shape {
  constructor(args) {
    super();
    this.points = [];

    this.create = (width, height) => {
      switch (direction) {
        case "right": return this.createRight(width, height);
        case "left": return this.createLeft(width, height);
        case "top": return this.createTop(width, height);
        case "bottom": return this.createBottom(width, height);
        default: throw new Error("Arrowhead diretion must be: right,left,top, or bottom");
      }
    };
  }

}