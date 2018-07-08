import Layer from "./layer";
import ZoomInSvg from "./images/zoom_in-24px.svg";
import ZoomOutSvg from "./images/zoom_out-24px.svg";
import SettingsSvg from "./images/settings-20px.svg";

export default class View {
  constructor(graph) {
    this.graph = graph;
    this.isMouseDown = false;
    this.startCoords = { x: 0, y: 0 };
    this.lastCoords = { x: 0, y: 0 };

    const graphElement = document.getElementById(this.graph.id);
    graphElement.innerHTML = `<canvas id='${this.graph.canvasId}'></canvas>`;

    this.canvas = document.getElementById(this.graph.canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.layers = { default: new Layer(this) };
    this.graph.canvasId = `canvas-${graph.id}`;

    graphElement.onmousedown = (e) => {
      this.isMouseDown = true;
      const { x, y } = this.lastCoords;
      const startX = e.offsetX - x;
      const startY = e.offsetY - y;
      this.startCoords = { x: startX, y: startY };
    };

    this.canvas.onmouseup = (e) => {
      this.isMouseDown = false;
      const { x, y } = this.startCoords;
      const lastX = e.offsetX - x;
      const lastY = e.offsetY - y;
      this.lastCoords = { x: lastX, y: lastY };
    };

    graphElement.onmousemove = (e) => {
      if (!this.isMouseDown) { return; }

      const { x, y } = this.startCoords;
      const diffX = (x - e.offsetX) * -1;
      const diffY = y - e.offsetY;

      const {
        xDistance,
        yDistance,
        width,
        height,
      } = this.getSelectedLayer().calcs;

      const changeX = diffX / width;
      const changeY = diffY / height;
      const offsetX = xDistance * changeX;
      const offsetY = yDistance * changeY;
      /*
      console.log(`diffX: ${diffX}, diffY: ${diffY}`);
      console.log(`changeX: ${changeX}, changeY: ${changeY}`);
      console.log(`xDistance: ${xDistance}, yDistance: ${yDistance}`);
      */

      console.log(`offsetX: ${offsetX}, offsetY: ${offsetY}`);

      const xAxis = this.graph.config.axes.x;
      xAxis.offset = offsetX;

      const yAxis = this.graph.config.axes.y;
      yAxis.offset = offsetY;

      this.draw();
    };

    this.getSelectedLayer = () => this.layers.default; // default for now

    this.adjustLayout();
    window.onresize = () => {
      this.adjustLayout();
      this.draw();
    };
  }

  adjustLayout() {
    // TODO: Currently only support full width
    const graphElement = document.getElementById(this.graph.id);
    const pixelRatio = window.devicePixelRatio || 1;

    // const realWidth = window.innerHeight > window.innerWidth ?
    // Math.round(1.0 * window.innerWidth) :
    // Math.round(1.0 * window.innerHeight);

    const width = Math.round(1.0 * window.innerWidth);
    const height = Math.round(1.0 * window.innerHeight);

    graphElement.style.position = "relative";
    graphElement.style.width = `${width}px`;
    graphElement.style.height = `${height}px`;

    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    Object.keys(this.layers).forEach(x => this.layers[x].draw());

    const l = 35;
    const m = 5;
    const left = this.canvas.width - (m + l);
    this.drawSvgImage(ZoomInSvg, left, m, l, l);
    this.drawSvgImage(ZoomOutSvg, left, l + m, l, l);
    this.drawSvgImage(SettingsSvg, left, (l * 2) + m, l, l);
  }

  drawSvgImage(src, x, y, w, h) {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${src}`;
    image.onload = () => this.ctx.drawImage(image, x, y, w, h);
  }
}
