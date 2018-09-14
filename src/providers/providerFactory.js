export default class providerFactory {
  constructor() {
    this.providers = {};
  }

  create(name) {
    return this.providers[name];
  }

  register(name, provider) {
    this.providers[name] = provider;
  }
}
