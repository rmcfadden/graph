export default class providerFactory {
  constructor() {
    this.providers = {};
  }

  create(name) {
    const provider = this.providers[name];
    return provider;
  }

  register(provider) {
    this.providers[provider.name] = provider;
  }
}
