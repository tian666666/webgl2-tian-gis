class Scene {
  items: any[];
  constructor() {
    this.items = [];
  }

  add(itm: any) {
    this.items.push(itm);
    return this;
  }
}

export default Scene;
