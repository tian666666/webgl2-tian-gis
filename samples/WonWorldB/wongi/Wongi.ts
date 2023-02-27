import Camera from "./data/Camera";
import Renderer from "./rendering/Renderer";

/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-15 21:13:38
 * @LastEditTime: 2023-02-18 00:42:09
 * @LastEditors: tianyw
 */
export class Wongi {
  //............................
  //Main Objects
  static camera: Camera | null = null;
  static scene: any;
  static render: Renderer;
  static loop: any;
  static controller: any;

  //............................
  //Shared Global Data
  static deltaTime: number = 0;
  static sinceStart: number = 1;

  //............................
  //Resources
  static shaders: Map<any, any> = new Map();
  static materials: Map<any, any> = new Map();
  static vaos: Map<any, any> = new Map();
  static ubos: Map<any, any> = new Map();
  static textures: Map<any, any> = new Map();
  static tempCache: Map<any, any> = new Map();

  static getMaterial(key: string) {
    const m = this.materials.get(key);
    if (!m) {
      console.log("Material Not Found %s", key);
      return null;
    }
    return m;
  }

  static getUBO(key: string) {
    const m = this.ubos.get(key);
    if (!m) {
      console.log("UBO Not Found %s", key);
      return null;
    }
    return m;
  }

  static getTexture(key: string) {
    const m = this.textures.get(key);
    if (!m) {
      console.log("Texture Not Found %s", key);
      return null;
    }
    return m;
  }

  static popTempCache(key: string) {
    const m = this.tempCache.get(key);
    if (!m) {
      console.log("TempCache Not Found %s", key);
      return null;
    }

    this.tempCache.delete(key);
    return m;
  }

  //............................
  //Constants
  static PNT: number = 0;
  static LINE: number = 1;
  static LINE_LOOP: number = 2;
  static LINE_STRIP: number = 3;
  static TRI: number = 4;
  static TRI_STRIP: number = 5;
}
