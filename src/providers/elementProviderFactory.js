import ProviderFactory from "./providerFactory";
import RectangleElementProvider from "./rectangleElementProvider";
import ImageElementProvider from "./imageElementProvider";
import ArcElementProvider from "./arcElementProvider";
import TextElementProvider from "./textElementProvider";
import LineElementProvider from "./lineElementProvider";

export default class elementProviderFactory extends ProviderFactory {
  constructor() {
    super();
    this.register("rectangle", RectangleElementProvider);
    this.register("image", ImageElementProvider);
    this.register("arc", ArcElementProvider);
    this.register("text", TextElementProvider);
    this.register("line", LineElementProvider);
  }
}
