export default class Layer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
  }

  setCanvas(id) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
  }

  drawSvgImage(src, x, y, w, h, name) {
    const image = new Image();
    image.onload = () => this.ctx.drawImage(image, x, y, w, h);
    image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
    this.elements.push({
      left: x,
      top: y,
      width: w,
      height: h,
      element: image,
      name,
    });
  }

  drawLine() {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(300, 150);
    this.ctx.stroke();
  }
}
