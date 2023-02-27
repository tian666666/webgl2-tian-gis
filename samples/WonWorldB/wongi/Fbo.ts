import WonG from "./gl";

interface IFbo {
  frameWidth: number;
  frameHeight: number;
  id: WebGLFramebuffer;
  [key: string]: any; // 用于动态扩充属性字段  key 为 string 类型，value 为 any 类型
}
class Fbo {
  fbo: IFbo | null;
  aryDrawBuf: number[];
  constructor() {
    this.fbo = null;
    this.aryDrawBuf = [];
  }

  //-------------------------------------------------
  // START AND COMPLETE CREATING FRAME BUFFER
  //-------------------------------------------------
  create(w: number | null = null, h: number | null = null) {
    if (w === null) w = WonG.width;
    if (h === null) h = WonG.height;

    this.fbo = {
      frameWidth: w,
      frameHeight: h,
      id: (
        WonG.ctx as WebGL2RenderingContext
      ).createFramebuffer() as WebGLFramebuffer
    };
    this.aryDrawBuf.length = 0;

    (WonG.ctx as WebGL2RenderingContext).bindFramebuffer(
      (WonG.ctx as WebGL2RenderingContext).FRAMEBUFFER,
      this.fbo.id
    );
    return this;
  }

  finalize() {
    if (!WonG.ctx) return this.fbo;
    //Assign which buffers are going to be written too
    WonG.ctx.drawBuffers(this.aryDrawBuf);

    //Check if the Frame has been setup Correctly.
    switch (WonG.ctx.checkFramebufferStatus(WonG.ctx.FRAMEBUFFER)) {
      case WonG.ctx.FRAMEBUFFER_COMPLETE:
        break;
      case WonG.ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        console.log("FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        break;
      case WonG.ctx.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        console.log("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        break;
      case WonG.ctx.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        console.log("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        break;
      case WonG.ctx.FRAMEBUFFER_UNSUPPORTED:
        console.log("FRAMEBUFFER_UNSUPPORTED");
        break;
      case WonG.ctx.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
        console.log("FRAMEBUFFER_INCOMPLETE_MULTISAMPLE");
        break;
      case WonG.ctx.RENDERBUFFER_SAMPLES:
        console.log("RENDERBUFFER_SAMPLES");
        break;
    }

    //Cleanup
    WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, null);
    WonG.ctx.bindRenderbuffer(WonG.ctx.RENDERBUFFER, null);
    WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, null);

    //Return final struct
    return this.fbo;
  }

  cleanUp() {
    this.fbo = null;
    return this;
  }
  //endregion

  //-------------------------------------------------
  // COLOR BUFFERS
  //-------------------------------------------------
  texColorBuffer(name = "bColor", cAttachNum = 0) {
    if (!WonG.ctx) return this;
    //Up to 16 texture attachments 0 to 15
    const buf = { id: WonG.ctx.createTexture() };

    WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, buf.id);
    WonG.ctx.texImage2D(
      WonG.ctx.TEXTURE_2D,
      0,
      WonG.ctx.RGBA,
      (this.fbo as IFbo).frameWidth,
      (this.fbo as IFbo).frameHeight,
      0,
      WonG.ctx.RGBA,
      WonG.ctx.UNSIGNED_BYTE,
      null
    );
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_MAG_FILTER,
      WonG.ctx.LINEAR
    ); //NEAREST
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_MIN_FILTER,
      WonG.ctx.LINEAR
    ); //NEAREST

    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);	//Stretch image to X position
    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);	//Stretch image to Y position

    WonG.ctx.framebufferTexture2D(
      WonG.ctx.FRAMEBUFFER,
      WonG.ctx.COLOR_ATTACHMENT0 + cAttachNum,
      WonG.ctx.TEXTURE_2D,
      buf.id,
      0
    );

    //Save Attachment to enable on finalize
    this.aryDrawBuf.push(WonG.ctx.COLOR_ATTACHMENT0 + cAttachNum);
    (this.fbo as IFbo)[name] = buf; // 动态属性字段及其值
    return this;
  }

  multiSampleColorBuffer(name: string, cAttachNum: number, sampleSize = 4) {
    if (!WonG.ctx) return this;
    //NOTE, Only sampleSize of 4 works, any other value crashes.
    const buf = { id: WonG.ctx.createRenderbuffer() };

    WonG.ctx.bindRenderbuffer(WonG.ctx.RENDERBUFFER, buf.id); //Bind Buffer

    //Set Data Size
    WonG.ctx.renderbufferStorageMultisample(
      WonG.ctx.RENDERBUFFER,
      sampleSize,
      WonG.ctx.RGBA8,
      (this.fbo as IFbo).frameWidth,
      (this.fbo as IFbo).frameHeight
    );

    //Bind buf to color attachment
    WonG.ctx.framebufferRenderbuffer(
      WonG.ctx.FRAMEBUFFER,
      WonG.ctx.COLOR_ATTACHMENT0 + cAttachNum,
      WonG.ctx.RENDERBUFFER,
      buf.id
    );

    //Save Attachment to enable on finalize
    this.aryDrawBuf.push(WonG.ctx.COLOR_ATTACHMENT0 + cAttachNum);
    (this.fbo as IFbo)[name] = buf;
    return this;
  }
  //endregion

  //-------------------------------------------------
  // DEPTH BUFFERS
  //-------------------------------------------------
  depthBuffer(isMultiSample = false) {
    if (!WonG.ctx) return this;
    (this.fbo as IFbo).bDepth = WonG.ctx.createRenderbuffer();
    WonG.ctx.bindRenderbuffer(WonG.ctx.RENDERBUFFER, (this.fbo as IFbo).bDepth);

    //Regular render Buffer
    if (!isMultiSample) {
      WonG.ctx.renderbufferStorage(
        WonG.ctx.RENDERBUFFER,
        WonG.ctx.DEPTH_COMPONENT16,
        (this.fbo as IFbo).frameWidth,
        (this.fbo as IFbo).frameHeight
      );

      //Set render buffer to do multi samples
    } else {
      WonG.ctx.renderbufferStorageMultisample(
        WonG.ctx.RENDERBUFFER,
        4,
        WonG.ctx.DEPTH_COMPONENT16,
        (this.fbo as IFbo).frameWidth,
        (this.fbo as IFbo).frameHeight
      ); //DEPTH_COMPONENT24
    }

    //Attach buffer to frame
    WonG.ctx.framebufferRenderbuffer(
      WonG.ctx.FRAMEBUFFER,
      WonG.ctx.DEPTH_ATTACHMENT,
      WonG.ctx.RENDERBUFFER,
      (this.fbo as IFbo).bDepth
    );
    return this;
  }

  texDepthBuffer() {
    if (!WonG.ctx) return this;
    //Up to 16 texture attachments 0 to 15
    const buf = { id: WonG.ctx.createTexture() };

    WonG.ctx.bindTexture(WonG.ctx.TEXTURE_2D, buf.id);
    //ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_MAG_FILTER,
      WonG.ctx.NEAREST
    );
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_MIN_FILTER,
      WonG.ctx.NEAREST
    );
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_WRAP_S,
      WonG.ctx.CLAMP_TO_EDGE
    );
    WonG.ctx.texParameteri(
      WonG.ctx.TEXTURE_2D,
      WonG.ctx.TEXTURE_WRAP_T,
      WonG.ctx.CLAMP_TO_EDGE
    );
    WonG.ctx.texStorage2D(
      WonG.ctx.TEXTURE_2D,
      1,
      WonG.ctx.DEPTH_COMPONENT16,
      (this.fbo as IFbo).frameWidth,
      (this.fbo as IFbo).frameHeight
    );

    WonG.ctx.framebufferTexture2D(
      WonG.ctx.FRAMEBUFFER,
      WonG.ctx.DEPTH_ATTACHMENT,
      WonG.ctx.TEXTURE_2D,
      buf.id,
      0
    );

    (this.fbo as IFbo).bDepth = buf;
    return this;
  }
  //endregion

  //-------------------------------------------------
  // STATIC FUNCTIONS
  //-------------------------------------------------
  static readPixel(fbo: IFbo, x: number, y: number, cAttachNum: number) {
    const p = new Uint8Array(4);
    if (!WonG.ctx) return p;
    WonG.ctx.bindFramebuffer(WonG.ctx.READ_FRAMEBUFFER, fbo.id);
    WonG.ctx.readBuffer(WonG.ctx.COLOR_ATTACHMENT0 + cAttachNum);
    WonG.ctx.readPixels(x, y, 1, 1, WonG.ctx.RGBA, WonG.ctx.UNSIGNED_BYTE, p);
    WonG.ctx.bindFramebuffer(WonG.ctx.READ_FRAMEBUFFER, null);
    return p;
  }

  static activate(fbo: IFbo) {
    if (!WonG.ctx) return this;
    WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, fbo.id);
    return this;
  }
  static deactivate() {
    if (!WonG.ctx) return this;
    WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, null);
    return this;
  }
  static clear(fbo: IFbo, unbind = true) {
    if (!WonG.ctx) return;
    WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, fbo.id);
    WonG.ctx.clear(WonG.ctx.COLOR_BUFFER_BIT | WonG.ctx.DEPTH_BUFFER_BIT);
    if (unbind) WonG.ctx.bindFramebuffer(WonG.ctx.FRAMEBUFFER, null);
  }

  static blit(fboRead: IFbo, fboWrite: IFbo) {
    if (!WonG.ctx) return;
    //bind the two Frame Buffers
    WonG.ctx.bindFramebuffer(WonG.ctx.READ_FRAMEBUFFER, fboRead.id);
    WonG.ctx.bindFramebuffer(WonG.ctx.DRAW_FRAMEBUFFER, fboWrite.id);

    //Clear Frame buffer being copied to.
    WonG.ctx.clearBufferfv(WonG.ctx.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);

    //Transfer Pixels from one FrameBuffer to the Next
    WonG.ctx.blitFramebuffer(
      0,
      0,
      fboRead.frameWidth,
      fboRead.frameHeight,
      0,
      0,
      fboWrite.frameWidth,
      fboWrite.frameHeight,
      WonG.ctx.COLOR_BUFFER_BIT,
      WonG.ctx.NEAREST
    );

    //Unbind
    WonG.ctx.bindFramebuffer(WonG.ctx.READ_FRAMEBUFFER, null);
    WonG.ctx.bindFramebuffer(WonG.ctx.DRAW_FRAMEBUFFER, null);
  }

  static basicTextureFrameBuffer() {
    const oFbo = new Fbo();
    const fbo = oFbo.create().texColorBuffer().texDepthBuffer().finalize();
    oFbo.cleanUp();
    return fbo;
  }
  //endregion

  /*


	static delete(fbo){
		//TODO, Delete using the Cache name, then remove it from cache.
		ctx.deleteRenderbuffer(fbo.depth);
		ctx.deleteTexture(fbo.texColor);
		ctx.deleteFramebuffer(fbo.ptr);
	}

	*/
}

export default Fbo;
