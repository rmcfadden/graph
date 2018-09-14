import ProviderFactory from "./providerFactory";
import RectangleElementProvider from "./rectangleElementProvider";
import ImageElementProvider from "./imageElementProvider";


export default class elementProviderFactory extends ProviderFactory {
  constructor() {
    super();
    this.register("rectangle", RectangleElementProvider);
    this.register("image", ImageElementProvider);
  }
}
