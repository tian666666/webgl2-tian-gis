import WonG from "../gl";
import Shader from "../Shader";

class IWebGLFramebuffer extends WebGLFramebuffer {
  id: string = "";
  constructor() {
    super();
  }
}

class Renderer {
  frameBuffer: IWebGLFramebuffer | null;
  material: any;
  shader: any;
  options: any;
  constructor() {
    //Render Objects
    this.frameBuffer = null;
    this.material = null;
    this.shader = null;
    //this.vao			= null;

    //Misc
    this.options = {
      blend: { state: false, id: (WonG.ctx as WebGL2RenderingContext).BLEND },
      sampleAlphaCoverage: {
        state: false,
        id: (WonG.ctx as WebGL2RenderingContext).SAMPLE_ALPHA_TO_COVERAGE
      },
      cullFace: {
        state: true,
        id: (WonG.ctx as WebGL2RenderingContext).CULL_FACE
      },
      depthTest: {
        state: true,
        id: (WonG.ctx as WebGL2RenderingContext).DEPTH_TEST
      }
    };
  }

  useCustomBuffer(fb: IWebGLFramebuffer) {
    this.frameBuffer = fb;
    return this;
  }
  setFrameBuffer(fb: WebGLFramebuffer | null = null) {
    (WonG.ctx as WebGL2RenderingContext).bindFramebuffer(
      (WonG.ctx as WebGL2RenderingContext).FRAMEBUFFER,
      fb
    );
    return this;
  }

  //----------------------------------------------
  //region Clear and Loading
  clearMaterial() {
    this.material = null;
    return this;
  }

  //Load up a shader
  loadShader(s: any) {
    if (this.shader === s) return;
    this.shader = s;
    (WonG.ctx as WebGL2RenderingContext).useProgram(s.program);
    return this;
  }

  //Load Material and its shader

  loadMaterial(mat: any) {
    //...............................
    //If material is the same, exit.
    if (!mat) return;
    if (this.material === mat) return;
    this.material = mat;

    //...............................
    //Is the shader for the material different
    if (this.shader !== mat.shader) {
      this.shader = mat.shader;
      (WonG.ctx as WebGL2RenderingContext).useProgram(this.shader.program);
    }

    //...............................
    //Push any saved uniform values to shader.
    mat.applyUniforms();

    //...............................
    //Enabled/Disable GL Options
    let o;
    for (o in mat.options) {
      if (this.options[o].state !== mat.options[o]) {
        this.options[o].state = mat.options[o];
        (WonG.ctx as WebGL2RenderingContext)[
          this.options[o].state ? "enable" : "disable"
        ](this.options[o].id);
      }
    }

    //...............................
    return this;
  }

  loadRenderable(r: any) {
    //if shader require special uniforms from model, apply
    r.updateMatrix();
    if (this.shader.options.modelMatrix)
      this.shader.setUniform(Shader.UNIFORM_MODELMAT, r.worldMatrix);
    if (this.shader.options.normalMatrix)
      this.shader.setUniform(Shader.UNIFORM_NORMALMAT, r.normalMatrix);

    //Apply GL Options
    let o;
    for (o in r.options) {
      if (this.options[o] && this.options[o].state !== r.options[o]) {
        this.options[o].state = r.options[o];
        (WonG.ctx as WebGL2RenderingContext)[
          this.options[o].state ? "enable" : "disable"
        ](this.options[o].id);
      }
    }
    return this;
  }

  renderableComplete() {
    (WonG.ctx as WebGL2RenderingContext).bindVertexArray(null);
    return this;
  }
  //endregion

  //----------------------------------------------
  //region Drawing
  //Handle Drawing a Renderable's VAO
  drawRenderable(r: any) {
    //...............................
    //if(this.vao != r.vao){
    //this.vao = r.vao;
    if (!r.vao) return this;
    if (!WonG.ctx) return this;
    WonG.ctx.bindVertexArray(r.vao.id);
    //}

    //...............................
    this.loadRenderable(r);

    if (!r.vao.isInstanced) {
      if (r.vao.isIndexed)
        WonG.ctx.drawElements(
          r.drawMode,
          r.vao.elmCount,
          WonG.ctx.UNSIGNED_SHORT,
          0
        );
      else WonG.ctx.drawArrays(r.drawMode, 0, r.vao.elmCount);
    } else {
      if (r.vao.isIndexed)
        WonG.ctx.drawElementsInstanced(
          r.drawMode,
          r.vao.elmCount,
          WonG.ctx.UNSIGNED_SHORT,
          0,
          r.vao.instanceCount
        );
      else
        WonG.ctx.drawArraysInstanced(
          r.drawMode,
          0,
          r.vao.elmCount,
          r.vao.instanceCount
        );
    }

    //...............................
    WonG.ctx.bindVertexArray(null);
    return this;
  }

  //Handle Drawing a Scene
  drawScene(ary: any) {
    //Set custom framebuffer if it has been set;
    if (this.frameBuffer && WonG.ctx)
      WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, this.frameBuffer.id);

    //Reset current framebuffer
    WonG.clear();

    let itm;
    for (itm of ary) {
      //Check for what Items to ignore.
      if (!itm.visible) continue;

      if (itm.draw)
        itm.draw(this); //Do Custom Drawing if the object has a Draw function
      else {
        //Do standard rendering steps

        if (itm.vao && itm.vao.elmCount === 0) continue; //No Elements to be drawn.

        this.loadMaterial(itm.material); //Load Material and Shader
        if (itm.onPreDraw) itm.onPreDraw(this); //Do any preperations needed before drawing if object has onPreDraw

        this.drawRenderable(itm); //Start Drawing
      }
    }
    return this;
  }
  //end region
}

export default Renderer;
