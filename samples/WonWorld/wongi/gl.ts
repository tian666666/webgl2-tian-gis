import { Wongi } from "./Wongi";

class WonG {
  static ctx: WebGL2RenderingContext | null;
  static width: number = 0;
  static height: number = 0;
  static BLEND_ALPHA: number = 0;
  static BLEND_ADDITIVE: number = 1;
  static BLEND_ALPHA_ADDITIVE: number = 2;
  UBOTransform: any;
  static init(canvas: HTMLCanvasElement | string) {
    //........................................
    //Get Context
    if (typeof canvas === "string")
      canvas = document.getElementById(canvas) as HTMLCanvasElement;
    WonG.ctx = canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (!WonG.ctx) {
      console.error("WebGL context is not available.");
      return false;
    }

    //........................................
    //Setup some defaults
    const c = WonG.ctx;
    c.cullFace(c.BACK); // Back is also default
    c.frontFace(c.CCW); // Dont really need to set it, its ccw by default.
    c.enable(c.DEPTH_TEST); // Shouldn't use this, use something else to add depth detection
    c.enable(c.CULL_FACE); // Cull back face, so only show triangles that are created clockwise
    c.depthFunc(c.LEQUAL); // Near things obscure far things
    c.blendFunc(
      c.SRC_ALPHA, // Setup default alpha blending
      c.ONE_MINUS_SRC_ALPHA
    );

    WonG.fitScreen() // Set the size of the canvas to a percent of the screen
      .setClearColor("#ffffff"); // Set clear color

    return this;
  }

  //------------------------------------------------------
  // GL Methods
  //------------------------------------------------------
  static clear() {
    if (WonG.ctx) {
      WonG.ctx.clear(WonG.ctx.COLOR_BUFFER_BIT | WonG.ctx.DEPTH_BUFFER_BIT);
    }
    return WonG;
  }

  static blendMode(m: number) {
    switch (m) {
      case WonG.BLEND_ALPHA:
        if (WonG.ctx) {
          WonG.ctx.blendFunc(WonG.ctx.SRC_ALPHA, WonG.ctx.ONE_MINUS_SRC_ALPHA);
        }
        break;
      case WonG.BLEND_ADDITIVE:
        if (WonG.ctx) {
          WonG.ctx.blendFunc(WonG.ctx.ONE, WonG.ctx.ONE);
        }
        break;
      case WonG.BLEND_ALPHA_ADDITIVE:
        if (WonG.ctx) {
          WonG.ctx.blendFunc(WonG.ctx.SRC_ALPHA, WonG.ctx.ONE);
        }
        break;
    }
    return WonG;
  }
  //endregion

  //------------------------------------------------------
  // Canvas Methods
  //------------------------------------------------------
  //Set the size of the canvas to fill a % of the total screen.
  static fitScreen(wp = 1, hp = 1) {
    WonG.setSize(window.innerWidth * wp, window.innerHeight * hp);
    return WonG;
  }

  //Set the size of the canvas html element and the rendering view port
  static setSize(w = 500, h = 500) {
    if (WonG.ctx) {
      //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
      (WonG.ctx.canvas as HTMLCanvasElement).style.width = w + "px";
      (WonG.ctx.canvas as HTMLCanvasElement).style.height = h + "px";
      WonG.ctx.canvas.width = w;
      WonG.ctx.canvas.height = h;

      //when updating the canvas size, must reset the viewport of the canvas
      //else the resolution webgl renders at will not change
      WonG.ctx.viewport(0, 0, w, h);
      WonG.width = w; //Need to save Width and Height to resize viewport back if we need to.
      WonG.height = h;
    }

    return WonG;
  }

  static setClearColor(hex: string) {
    if (hex.length > 7) {
      const a = WonG.rgbaArray(hex) as number[];
      if (WonG.ctx) {
        WonG.ctx.clearColor(a[0], a[1], a[2], a[3]);
      }
    } else {
      const a = WonG.rgbArray(hex) as number[];
      if (WonG.ctx) {
        WonG.ctx.clearColor(a[0], a[1], a[2], 1.0);
      }
    }
    return WonG;
  }
  //endregion

  //------------------------------------------------------
  // Data
  //------------------------------------------------------
  // #0000FF
  // #0000FF66
  static rgbArray(datas: string | string[]) {
    if (datas.length === 0) return null;
    const ary = Array.isArray(datas[0])
        ? datas[0]
        : Array.isArray(datas)
        ? datas
        : [datas],
      rtn = [];

    for (let i = 0, c, p; i < ary.length; i++) {
      if (ary[i].length < 6) continue;
      c = ary[i]; //Just an alias(copy really) of the color text, make code smaller.
      p = c[0] === "#" ? 1 : 0; //Determine starting position in char array to start pulling from

      rtn.push(
        parseInt(c[p] + c[p + 1], 16) / 255.0,
        parseInt(c[p + 2] + c[p + 3], 16) / 255.0,
        parseInt(c[p + 4] + c[p + 5], 16) / 255.0
      );
    }
    return rtn;
  }
  // #0000FF
  // #0000FF66
  static rgbaArray(datas: string) {
    if (datas.length === 0) return null;
    const ary = Array.isArray(datas[0])
        ? datas[0]
        : Array.isArray(datas)
        ? datas
        : [datas],
      rtn = [];

    for (let i = 0, c, p; i < ary.length; i++) {
      if (ary[i].length < 8) continue;
      c = ary[i]; //Just an alias(copy really) of the color text, make code smaller.
      p = c[0] === "#" ? 1 : 0; //Determine starting position in char array to start pulling from

      rtn.push(
        parseInt(c[p] + c[p + 1], 16) / 255.0,
        parseInt(c[p + 2] + c[p + 3], 16) / 255.0,
        parseInt(c[p + 4] + c[p + 5], 16) / 255.0,
        parseInt(c[p + 6] + c[p + 7], 16) / 255.0
      );
    }
    return rtn;
  }
  //endregion

  //------------------------------------------------------
  // Shaders tfeedback = null, tfeedbackInterleaved = true
  //------------------------------------------------------
  static createShader(
    vShaderTxt: string,
    fShaderTxt: string,
    doValidate = true,
    transFeedbackVars = null,
    transFeedbackInterleaved = true
  ) {
    if (!WonG.ctx) return;
    const vShader = WonG.compileShader(vShaderTxt, WonG.ctx.VERTEX_SHADER);
    if (!vShader) return null;

    const fShader = WonG.compileShader(fShaderTxt, WonG.ctx.FRAGMENT_SHADER);
    if (!fShader) {
      WonG.ctx.deleteShader(vShader);
      return null;
    }

    return WonG.createShaderProgram(
      vShader,
      fShader,
      doValidate,
      transFeedbackVars,
      transFeedbackInterleaved
    );
  }

  //Create a shader by passing in its code and what type
  static compileShader(src: string, type: number) {
    if (!WonG.ctx) return;
    const shader = WonG.ctx.createShader(type) as WebGLShader;
    WonG.ctx.shaderSource(shader, src);
    WonG.ctx.compileShader(shader);

    //Get Error data if shader failed compiling
    if (!WonG.ctx.getShaderParameter(shader, WonG.ctx.COMPILE_STATUS)) {
      console.error(
        "Error compiling shader : " + src,
        WonG.ctx.getShaderInfoLog(shader)
      );
      WonG.ctx.deleteShader(shader);
      return null;
    }

    return shader;
  }

  //Link two compiled shaders to create a program for rendering.
  static createShaderProgram(
    vShader: WebGLShader,
    fShader: WebGLShader,
    doValidate = true,
    transFeedbackVars = null,
    transFeedbackInterleaved = true
  ) {
    if (!WonG.ctx) return;
    //Link shaders together
    const prog = WonG.ctx.createProgram() as WebGLProgram;
    WonG.ctx.attachShader(prog, vShader);
    WonG.ctx.attachShader(prog, fShader);

    //Force predefined locations for specific attributes. If the attibute isn't used in the shader its location will default to -1
    //ctx.bindAttribLocation(prog,ATTR_POSITION_LOC,ATTR_POSITION_NAME);
    //ctx.bindAttribLocation(prog,ATTR_NORMAL_LOC,ATTR_NORMAL_NAME);
    //ctx.bindAttribLocation(prog,ATTR_UV_LOC,ATTR_UV_NAME);

    //Need to setup Transform Feedback Varying Vars before linking the program.
    if (transFeedbackVars !== null) {
      WonG.ctx.transformFeedbackVaryings(
        prog,
        transFeedbackVars,
        transFeedbackInterleaved
          ? WonG.ctx.INTERLEAVED_ATTRIBS
          : WonG.ctx.SEPARATE_ATTRIBS
      );
    }

    WonG.ctx.linkProgram(prog);

    //Check if successful
    if (!WonG.ctx.getProgramParameter(prog, WonG.ctx.LINK_STATUS)) {
      console.error(
        "Error creating shader program.",
        WonG.ctx.getProgramInfoLog(prog)
      );
      WonG.ctx.deleteProgram(prog);
      return null;
    }

    //Only do this for additional debugging.
    if (doValidate) {
      WonG.ctx.validateProgram(prog);
      if (!WonG.ctx.getProgramParameter(prog, WonG.ctx.VALIDATE_STATUS)) {
        console.error(
          "Error validating program",
          WonG.ctx.getProgramInfoLog(prog)
        );
        WonG.ctx.deleteProgram(prog);
        return null;
      }
    }

    //Can delete the shaders since the program has been made.
    WonG.ctx.detachShader(prog, vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
    WonG.ctx.detachShader(prog, fShader);
    WonG.ctx.deleteShader(fShader);
    WonG.ctx.deleteShader(vShader);

    return prog;
  }
  //endregion

  //------------------------------------------------------
  // Texture
  //------------------------------------------------------
  static loadTexture(
    name: string,
    img: TexImageSource,
    doYFlip = false,
    useMips = false,
    wrapMode = 0,
    filterMode = 0
  ) {
    if (!WonG.ctx) return;
    const tex = WonG.ctx.createTexture() as WebGLTexture;
    Wongi.textures.set(name, tex);

    return WonG.updateTexture(name, img, doYFlip, useMips);
  }

  static updateTexture(
    name: string,
    img: TexImageSource,
    doYFlip = false,
    useMips = false,
    wrapMode = 0,
    filterMode = 0
  ) {
    if (!WonG.ctx) return;
    //can be used to pass video frames to gpu texture.
    const tex = Wongi.textures.get(name) as WebGLTexture;

    if (doYFlip) WonG.ctx.pixelStorei(WonG.ctx.UNPACK_FLIP_Y_WEBGL, true); //Flip the texture by the Y Position, So 0,0 is bottom left corner.

    WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, tex); //bind texture so we can start configuring it.
    WonG.ctx.texImage2D(
      WonG.ctx.TEXTURE_2D,
      0,
      WonG.ctx.RGBA,
      WonG.ctx.RGBA,
      WonG.ctx.UNSIGNED_BYTE,
      img
    ); //Push image to GPU.

    if (useMips) {
      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_MAG_FILTER,
        WonG.ctx.LINEAR
      ); //Setup up scaling
      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_MIN_FILTER,
        WonG.ctx.LINEAR_MIPMAP_NEAREST
      ); //Setup down scaling
      WonG.ctx.generateMipmap(WonG.ctx.TEXTURE_2D); //Precalc different sizes of texture for better quality rendering.
    } else {
      const filter = filterMode === 0 ? WonG.ctx.LINEAR : WonG.ctx.NEAREST,
        wrap = wrapMode === 0 ? WonG.ctx.REPEAT : WonG.ctx.CLAMP_TO_EDGE;

      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_MAG_FILTER,
        filter
      );
      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_MIN_FILTER,
        filter
      );
      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_WRAP_S,
        wrap
      );
      WonG.ctx.texParameteri(
        WonG.ctx.TEXTURE_2D,
        WonG.ctx.TEXTURE_WRAP_T,
        wrap
      );
    }

    WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, null); //Unbind

    if (doYFlip) WonG.ctx.pixelStorei(WonG.ctx.UNPACK_FLIP_Y_WEBGL, false); //Stop flipping textures
    return tex;
  }
  //endregion
}

//.........................
WonG.ctx = null;
WonG.width = 0;
WonG.height = 0;

WonG.BLEND_ALPHA = 0;
WonG.BLEND_ADDITIVE = 1;
WonG.BLEND_ALPHA_ADDITIVE = 2;

export default WonG;
