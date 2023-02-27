import WonG from "./gl";
import { Wongi } from "./Wongi";

//##################################################################
// Loading Functions
//Get shader code from an inline script tag, use that to load a shader.
function LoadInlineShader(elmName: string) {
  const shData = ParseShaderFile(
    (document.getElementById(elmName) as HTMLElement).innerText
  );
  if (shData === null) {
    console.log("error parsing inline Shader");
    return null;
  }

  const shader = LoadShader(shData);
  if (shader === null) {
    console.log("error compiling inline shader");
    return null;
  }

  if (shData.materials) LoadMaterials(shData);
  return shader;
}
interface IDat {
  shader: any;
  materials: any;
  vertex: string | null;
  fragment: string | null;
}
//Apply Snippets and Break shader file into a data struct that can be used for loading
function ParseShaderFile(shText: string) {
  const dat: IDat = {
    shader: null,
    materials: null,
    vertex: null,
    fragment: null
  };
  let posA, posB, txt, itm;

  //Loop threw the rtn struct to find all the tag elements that should be in the text file
  //THen parse out the text and save it to the object.
  for (itm in dat) {
    //...................................
    posA = shText.indexOf("<" + itm + ">") + itm.length + 2;
    posB = shText.indexOf("<\\" + itm + ">");
    if (posA === -1 || posB === -1) {
      if (itm === "materials") continue;

      console.log("Error parsing shader, missing ", itm);
      return null;
    }

    //...................................
    txt = shText.substring(posA, posB);

    switch (itm) {
      case "shader":
      case "materials": //These are JSON elements, parse them so they're ready for use.
        try {
          if (itm === "shader") {
            dat.shader = JSON.parse(txt);
          } else {
            dat.materials = JSON.parse(txt);
          }
        } catch (err) {
          console.log((err as Error).message, "\n", txt);
          return null;
        }
        break;
      default:
        if (itm === "vertex") {
          dat.vertex = txt.trim();
        } else {
          dat.fragment = txt.trim();
        }
        break;
    }
  }

  return dat;
}

//Deserialize Downloaded Shader files to create shaders and materials.
function LoadShader(js: IDat) {
  //===========================================
  //Create Shader
  const shader = new Shader(
    js.shader.name,
    js.vertex as string,
    js.fragment as string
  );
  if (shader.program === null) return null;

  //..............................
  //Setup Uniforms
  if (js.shader.uniforms && js.shader.uniforms.length > 0) {
    shader.prepareUniforms(js.shader.uniforms);
  }

  //..............................
  //Setup Uniform Buffer Objects
  if (js.shader.ubo && js.shader.ubo.length > 0) {
    let i;
    for (i = 0; i < js.shader.ubo.length; i++)
      shader.prepareUniformBlock(js.shader.ubo[i]);
  }

  //..............................
  //Setup Shader Options
  if (js.shader.options) {
    for (const o in js.shader.options) shader.options[o] = js.shader.options[o];
    // prepare buffers and uniforms
    // shader.options.normalMatrix = shader.useModelMatrix
    if (shader.options.modelMatrix)
      shader.prepareUniform(Shader.UNIFORM_MODELMAT, "mat4");
    if (shader.options.normalMatrix)
      shader.prepareUniform(Shader.UNIFORM_NORMALMAT, "mat3");
  }

  (WonG.ctx as WebGL2RenderingContext).useProgram(null);
  return shader;
}

//Load All all the materials for a specific shader
function LoadMaterials(js: IDat) {
  let m, mat, u, val, type;
  for (m of js.materials) {
    mat = new Material(m.name, js.shader.name);
    if (m.uniforms && m.uniforms.length > 0) mat.addUniforms(m.uniforms);

    //..............................
    //Load Options
    if (m.options) {
      for (var o in m.options) mat.options[o] = m.options[o];
    }
  }
}
//endregion

//##################################################################
// Material
class Material {
  name: string = "";
  shader: any;
  uniforms: Map<string, any> = new Map();
  options: any;
  constructor(name: string, shader = null) {
    //..................................../
    //If the shader is just the name, search resources for it.
    if (shader && typeof shader === "string") {
      const s = Wongi.shaders.get(shader);
      if (!s) {
        console.log("Can not find shader %s for material %s", shader, name);
        return;
      }
      shader = s;
    }

    //....................................
    this.options = {
      blend: false,
      sampleAlphaCoverage: false,
      depthTest: true
    };

    //....................................
    this.name = name;
    this.shader = shader;
    this.uniforms = new Map();

    if (name !== null) Wongi.materials.set(name, this);
  }

  addUniforms(ary: any) {
    let itm;
    for (itm of ary) this.addUniform(itm.name, itm.type, itm.value);
    return this;
  }

  addUniform(
    uName: string,
    uType: string,
    uValue: string | number[] | WebGLTexture
  ) {
    if (this.uniforms.has(uName)) {
      console.log("Uniform already exists : %s", uName);
      return this;
    }

    //..........................
    //Certain Types need processing of the value
    switch (uType) {
      case "rgb":
        uValue = WonG.rgbArray(uValue as string) as number[];
        break;
      case "rgba":
        uValue = WonG.rgbaArray(uValue as string) as number[];
        break;
      case "tex":
        const tmp =
          uValue instanceof WebGLTexture
            ? uValue
            : Wongi.getTexture(uValue as string);
        if (tmp === null) {
          console.log(
            "Material.addUniform: Texture not found %s for material %s uniform %s",
            uValue,
            this.name,
            uName
          );
          return this;
        } else uValue = tmp;
        break;
    }

    //..........................
    this.uniforms.set(uName, { type: uType, value: uValue });
    return this;
  }

  applyUniforms() {
    if (this.shader && this.uniforms.size > 0) {
      let key, itm;
      this.shader.resetTextureSlot();
      const ttt = this.uniforms;
      for ([key, itm] of this.uniforms) {
        if(itm.value.length === 0) {
          debugger;
        }
        this.shader.setUniform(key, itm.value);
      }
    }
    return this;
  }
}

interface IOp {
  modelMatrix: any;
  normalMatrix: any;
}
//##################################################################
// Shaders
class Shader {
  program: WebGLProgram;
  name: string | undefined;
  texSlot: number = 0;
  uniforms: Map<any, any> = new Map();
  options: any;

  static ATTRIB_POSITION_LOC = 0;
  static ATTRIB_NORMAL_LOC = 1;
  static ATTRIB_UV_LOC = 2;

  static ATTRIB_JOINT_IDX_LOC = 8;
  static ATTRIB_JOINT_WEIGHT_LOC = 9;

  static UNIFORM_MODELMAT = "u_modelMatrix";
  static UNIFORM_NORMALMAT = "u_normalMatrix";

  constructor(
    name: string,
    vertShader: string,
    fragShader: string,
    tfeedbackVar = null,
    tfeedbackInterleaved = true
  ) {
    this.program = WonG.createShader(
      vertShader,
      fragShader,
      true,
      tfeedbackVar,
      tfeedbackInterleaved
    ) as WebGLProgram;

    //............................
    if (this.program !== null) {
      this.name = name;
      this.texSlot = 0; //Keep track which texSlot has been used when loading textures.
      this.options = { modelMatrix: false, normalMatrix: false };

      (WonG.ctx as WebGL2RenderingContext).useProgram(this.program);
      this.uniforms = new Map();

      Wongi.shaders.set(name, this);
    }
  }

  //---------------------------------------------------
  // Methods For Shader Setup.
  //---------------------------------------------------
  //Map uniform names to location integers
  prepareUniform(uName: string, uType: string) {
    const loc = (WonG.ctx as WebGL2RenderingContext).getUniformLocation(
      this.program,
      uName
    );

    if (loc !== null) this.uniforms.set(uName, { loc: loc, type: uType });
    else
      console.log(
        "prepareUniform : Uniform not found %s in %s",
        uName,
        this.name
      );

    return this;
  }

  prepareUniforms(ary: any) {
    let itm, loc;
    for (itm of ary) {
      loc = (WonG.ctx as WebGL2RenderingContext).getUniformLocation(
        this.program,
        itm.name
      );

      if (loc !== null)
        this.uniforms.set(itm.name, { loc: loc, type: itm.type });
      else
        console.log(
          "prepareUniforms : Uniform not found %s in %s",
          itm.name,
          this.name
        );
    }

    return this;
  }

  prepareUniformBlock(uboName: string) {
    const bIdx = (WonG.ctx as WebGL2RenderingContext).getUniformBlockIndex(
      this.program,
      uboName
    );
    if (bIdx > 1000) {
      console.log("Ubo not found in shader %s : %s ", this.name, uboName);
      return this;
    }

    const ubo = Wongi.getUBO(uboName);
    if (!ubo) {
      console.log(
        "Can not find UBO in Wongi cache : %s for %s",
        uboName,
        this.name
      );
      return this;
    }

    (WonG.ctx as WebGL2RenderingContext).uniformBlockBinding(
      this.program,
      bIdx,
      ubo.bindPoint
    );
    return this;
  }

  //---------------------------------------------------
  // Setters Getters
  //---------------------------------------------------
  setOptions(useModelMat: any = null, useNormalMat: any = null) {
    if (useModelMat !== null) (this.options as IOp).modelMatrix = useModelMat;
    if (useNormalMat !== null)
      (this.options as IOp).normalMatrix = useNormalMat;

    return this;
  }

  //   //Uses a 2 item group argument array. Uniform_Name, Uniform_Value;
  //   setUniforms(uName:string, uValue:any) {
  //     if (arguments.length % 2 !== 0) {
  //       console.log("setUniforms needs arguments to be in pairs.");
  //       return this;
  //     }

  //     for (let i = 0; i < arguments.length; i += 2)
  //       this.setUniform(arguments[i], arguments[i + 1]);

  //     return this;
  //   }

  setUniform(uName: any, uValue: any) {
    const itm = this.uniforms.get(uName);
    if (!itm) {
      console.log("uniform not found %s in %s", uName, this.name);
      return this;
    }
    if (!WonG.ctx) return this;
    switch (itm.type) {
      case "float":
        WonG.ctx.uniform1f(itm.loc, uValue);
        break;
      case "afloat":
        WonG.ctx.uniform1fv(itm.loc, uValue);
        break;
      case "vec2":
        WonG.ctx.uniform2fv(itm.loc, uValue);
        break;
      case "vec3":
        // console.log("vec3tian", uValue);
        WonG.ctx.uniform3fv(itm.loc, uValue);
        break;
      case "vec4":
        WonG.ctx.uniform4fv(itm.loc, uValue);
        break;
      case "int":
        WonG.ctx.uniform1i(itm.loc, uValue);
        break;

      case "mat4":
        WonG.ctx.uniformMatrix4fv(itm.loc, false, uValue);
        break;
      case "mat3":
        WonG.ctx.uniformMatrix3fv(itm.loc, false, uValue);
        break;
      case "mat2x4":
        WonG.ctx.uniformMatrix2x4fv(itm.loc, false, uValue);
        break;
      case "sample2D":
        WonG.ctx.activeTexture(WonG.ctx.TEXTURE0 + this.texSlot);
        WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, uValue);
        WonG.ctx.uniform1i(itm.loc, this.texSlot);
        this.texSlot++;
        break;
      default:
        console.log(
          "unknown uniform type %s for %s in  %s",
          itm.type,
          uName,
          this.name
        );
        break;
    }
    return this;
  }

  //---------------------------------------------------
  // Methods
  //---------------------------------------------------
  bind() {
    (WonG.ctx as WebGL2RenderingContext).useProgram(this.program);
    return this;
  }
  unbind() {
    (WonG.ctx as WebGL2RenderingContext).useProgram(null);
    return this;
  }

  resetTextureSlot() {
    this.texSlot = 0;
  }

  //function helps clean up resources when shader is no longer needed.
  dispose() {
    //unbind the program if its currently active
    if (
      (WonG.ctx as WebGL2RenderingContext).getParameter(
        (WonG.ctx as WebGL2RenderingContext).CURRENT_PROGRAM
      ) === this.program
    )
      (WonG.ctx as WebGL2RenderingContext).useProgram(null);
    (WonG.ctx as WebGL2RenderingContext).deleteProgram(this.program);
  }
}

//##################################################################
// Constants

Shader.ATTRIB_POSITION_LOC = 0;
Shader.ATTRIB_NORMAL_LOC = 1;
Shader.ATTRIB_UV_LOC = 2;

Shader.ATTRIB_JOINT_IDX_LOC = 8;
Shader.ATTRIB_JOINT_WEIGHT_LOC = 9;

Shader.UNIFORM_MODELMAT = "u_modelMatrix";
Shader.UNIFORM_NORMALMAT = "u_normalMatrix";

//##################################################################
// Export

export {
  ParseShaderFile,
  LoadInlineShader,
  LoadMaterials,
  LoadShader,
  Material
};
export default Shader;
