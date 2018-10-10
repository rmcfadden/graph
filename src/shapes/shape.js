export default class Shape {
  constructor() {
    this.points = [];
  }

  pos(x, y) {
    this.points = this.points.map(p => ({ x: p.x + x, y: p.y + y }));
  }

  scale(x, y) {
    this.points = this.points.map(p => ({ x: p.x * x, y: p.y * y }));
  }
}
