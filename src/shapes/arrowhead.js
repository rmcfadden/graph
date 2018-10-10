import Shape from "./shape";

export default class Arrowhead extends Shape {
  constructor(args) {
    super();
    this.points = [];

    this.create = (width, height, direction) => {
      switch (direction) {
        case "right": return this.createRight(width, height);
        case "left": return this.createLeft(width, height);
        case "top": return this.createTop(width, height);
        case "bottom": return this.createBottom(width, height);
        default: throw new Error("Arrowhead diretion must be: right,left,top, or bottom");
      }
    };

    this.createRight = (width, height) => {
      const topLeft = { x: 0, y: 0 };
      const middleRight = { x: width - 1, y: height / 2.0 };
      const bottomLeft = { x: 0, y: height - 1 };
      return [topLeft, middleRight, bottomLeft];
    };

    this.createLeft = (width, height) => {
      const topRight = { x: width - 1, y: 0 };
      const middleLeft = { x: 0, y: height / 2.0 };
      const bottomRight = { x: width - 1, y: height - 1 };
      return [topRight, middleLeft, bottomRight];
    };

    this.createTop = (width, height) => {
      const bottomLeft = { x: 0, y: height };
      const topMiddle = { x: width / 2.0, y: 0 };
      const bottomRight = { x: width - 1, y: height - 1 };
      return [bottomLeft, topMiddle, bottomRight];
    };

    this.createBottom = (width, height) => {
      const topLeft = { x: 0, y: 0 };
      const bottomMiddle = { x: width / 2.0, y: height };
      const topRight = { x: width - 1, y: 0 };
      return [topLeft, bottomMiddle, topRight];
    };

    if (args && args.width && args.height) {
      this.points = this.create(args.width, args.height, args.direction);
    }
  }
}
