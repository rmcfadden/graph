export default class imageElementProvider {
  static draw({
    src,
    x,
    y,
    width,
    height,
    layer,
  } = {}) {
    const cachedImage = layer.images[src];
    const { ctx } = layer;
    if (!cachedImage) {
      const image = new Image();
      image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
      image.onload = () => ctx.drawImage(image, x, y, width, height);
      layer.images[src] = image;
    } else {
      ctx.drawImage(cachedImage, x, y, width, height);
    }
  }
}
