import WonG from "../gl";
import { ParseShaderFile, LoadShader, LoadMaterials } from "../Shader";

export default class Loader {
  //------------------------------------------------------
  // Textures
  //------------------------------------------------------
  //Push Images to the GPU to be used as textures
  static textures(ary: any) {
    let itm, doYFlip, useMips;
    for (itm of ary) {
      if (itm.type !== "image") continue;

      doYFlip = itm.doYFlip === true;
      useMips = itm.useMips === true;

      WonG.loadTexture(itm.name, itm.download, doYFlip, useMips);
    }
  }
  //endregion

  //------------------------------------------------------
  // Shader & Materials
  //------------------------------------------------------
  static materials(ary: any) {
    let itm;
    for (itm of ary) {
      if (itm.materials && itm.materials.length > 0) LoadMaterials(itm);
    }
  }

  //Just filter out Snippets from the download list
  static getSnippets(ary: any) {
    let itm,
      snipAry = new Map();
    for (itm of ary) {
      if (itm.type === "snippet") snipAry.set(itm.file, itm.download);
    }
    return snipAry;
  }

  static compileShaders(ary: any) {
    let itm;
    for (itm of ary) {
      if (LoadShader(itm) === null) return false;
    }
    return true;
  }

  //Handle Snippets for shader text, then handle JSON parsing
  //of Shader and material information. Return list of shader JSON.
  static parseShaders(ary: any, mapSnip: any) {
    //................................................
    let itm,
      txt,
      tmp,
      rtn = new Array();
    for (itm of ary) {
      if (itm.type !== "shader") continue;
      txt = itm.download;

      //------------------------------------
      // Check if there is any Snippets that needs to be
      // Inserted into the shader code
      if (itm.snippets) {
        for (let i = 0; i < itm.snippets.length; i++) {
          txt = txt.replace(
            new RegExp("#snip " + itm.snippets[i], "gi"),
            mapSnip.get(itm.snippets[i])
          );
        }
      }

      //------------------------------------
      tmp = ParseShaderFile(txt);
      if (tmp === null) return null;
      else rtn.push(tmp);
    }

    return rtn;
  }
  //endregion
} //cls
