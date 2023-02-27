/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-16 23:41:27
 * @LastEditTime: 2023-02-20 21:14:47
 * @LastEditors: tianyw
 */
import WonG from "../gl";

class DynamicBuffer {
  BufByteSize: number;
  GLBufferType: number;
  ComponentLen: number;
  GLBuffer: WebGLBuffer;
  BufByteSizeUsed: number;
  GLArray: any;
  data: number[];
  constructor(
    bufID: WebGLBuffer,
    bufType: number,
    aryType: any,
    comLen: number,
    startSize: number
  ) {
    this.GLArray = aryType; //Pointer to special array types, like Float32Array
    this.GLBuffer = bufID; //GL Buffer Pointer
    this.GLBufferType = bufType; //GL Buffer Type WonG.ctx.ARRAY_BUFFER
    this.ComponentLen = comLen; //How many Array Elements needed to make on item, ie 3 floats = Vertex

    this.BufByteSizeUsed = 0; //How much data was pushed to the GPU.
    this.data = []; //Raw Data

    //How big is the buffer in bytes
    this.BufByteSize = aryType.BYTES_PER_ELEMENT * comLen * startSize;
  }

  getSize() {
    return this.BufByteSize;
  }
  getComponentCnt() {
    return (
      this.BufByteSizeUsed / this.GLArray.BYTES_PER_ELEMENT / this.ComponentLen
    );
  } //ex: how many verts in the array. tFloats / 3F_Vert
  setBuffer(v: WebGLBuffer) {
    this.GLBuffer = v;
    return this;
  }

  pushToGPU(newData = null) {
    if (!WonG.ctx) return;
    const finalData = new this.GLArray(newData || this.data),
      pushSize = finalData.length * this.GLArray.BYTES_PER_ELEMENT; //How many bytes to push to gpu.

    WonG.ctx.bindBuffer(this.GLBufferType, this.GLBuffer); //Activate Buffer

    //If data being push fits the existing buffer, send it up
    if (pushSize <= this.BufByteSize) {
      WonG.ctx.bufferSubData(this.GLBufferType, 0, finalData, 0, 0);

      //if not, we need to wipe out the data and resize the buffer with the new set of data.
    } else {
      this.BufByteSize = pushSize;

      //if(this.BufByteSizeUsed > 0) WonG.ctx.bufferData(this.GLBufferType, null, WonG.ctx.DYNAMIC_DRAW); //Clean up previus data

      WonG.ctx.bufferData(this.GLBufferType, finalData, WonG.ctx.DYNAMIC_DRAW);
    }

    WonG.ctx.bindBuffer(this.GLBufferType, null); //unbind buffer
    this.BufByteSizeUsed = pushSize; //finalData.length * this.GLArrayPtr.BYTES_PER_ELEMENT;	//save cnt so we can delete the buffer later on resize if need be.
  }

  static newFloat(bufPtr: WebGLBuffer, comLen: number, startSize: number) {
    return new DynamicBuffer(
      bufPtr,
      (WonG.ctx as WebGL2RenderingContext).ARRAY_BUFFER,
      Float32Array,
      comLen,
      startSize
    );
  }

  static newElement(bufPtr: WebGLBuffer, startSize: number) {
    return new DynamicBuffer(
      bufPtr,
      (WonG.ctx as WebGL2RenderingContext).ELEMENT_ARRAY_BUFFER,
      Uint16Array,
      1,
      startSize
    );
  }
}

export default DynamicBuffer;
