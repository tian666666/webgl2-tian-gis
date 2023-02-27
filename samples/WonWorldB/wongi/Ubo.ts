import WonG from "./gl";
import Shader from "./Shader";
import { Wongi } from "./Wongi";

//http://www.geeks3d.com/20140704/gpu-buffers-introduction-to-opengl-3-1-uniform-buffers-objects/

class Ubo {
  name: string;
  bindPoint: any;
  items: any;
  bufferID: any;
  bufferSize: number;
  constructor(bName: string, bPoint: any) {
    this.name = bName;
    this.bindPoint = bPoint;
    this.items = new Map();
    this.bufferID = null;
    this.bufferSize = 0;
  }

  bind() {
    if (!WonG.ctx) return this;
    WonG.ctx.bindBuffer(WonG.ctx.UNIFORM_BUFFER, this.bufferID);
    return this;
  }
  unbind() {
    if (!WonG.ctx) return this;
    WonG.ctx.bindBuffer(WonG.ctx.UNIFORM_BUFFER, null);
    return this;
  }

  finalize(unbind = true) {
    if (!WonG.ctx) return this;
    this.bufferSize = Ubo.calculate(this.items); // Calc all the Offsets and Lengths
    this.bufferID = WonG.ctx.createBuffer(); // Create Standard Buffer

    WonG.ctx.bindBuffer(WonG.ctx.UNIFORM_BUFFER, this.bufferID); // Bind it for work
    WonG.ctx.bufferData(
      WonG.ctx.UNIFORM_BUFFER,
      this.bufferSize,
      WonG.ctx.DYNAMIC_DRAW
    ); // Allocate Space in empty buf
    if (unbind) WonG.ctx.bindBuffer(WonG.ctx.UNIFORM_BUFFER, null); // Unbind
    WonG.ctx.bindBufferBase(
      WonG.ctx.UNIFORM_BUFFER,
      this.bindPoint,
      this.bufferID
    ); // Save Buffer to Uniform Buffer Bind point

    Wongi.ubos.set(this.name, this);
    return this;
  }

  addItem(iName: string, iType: any) {
    this.items.set(iName, { type: iType, offset: 0, chunkLen: 0, dataLen: 0 });
    return this;
  }

  updateItem(name: string, data: ArrayBufferView) {
    if (!WonG.ctx) return this;
    WonG.ctx.bufferSubData(
      WonG.ctx.UNIFORM_BUFFER,
      this.items.get(name).offset,
      data,
      0,
      0
    );
    return this;
  }

  //Size of types and alignment for calculating offset positions
  static getSize(type: string) {
    switch (
      type //[Alignment,Size]
    ) {
      case "float":
      case "int":
      case "b":
        return [4, 4];
      case "mat4":
        return [64, 64]; //16*4
      case "mat3":
        return [48, 48]; //16*3
      case "vec2":
        return [8, 8];
      case "vec3":
        return [16, 12]; //Special Case
      case "vec4":
        return [16, 16];
      default:
        return [0, 0];
    }
  }

  static calculate(m: any) {
    let chunk = 16, //Data size in Bytes, UBO using layout std140 needs to build out the struct in chunks of 16 bytes.
      tsize = 0, //Temp Size, How much of the chunk is available after removing the data size from it
      offset = 0, //Offset in the buffer allocation
      size, //Data Size of the current type
      key,
      itm,
      prevItm = null;

    for ([key, itm] of m) {
      //When dealing with arrays, Each element takes up 16 bytes regardless of type.
      if (!itm.arylen || itm.arylen === 0) size = Ubo.getSize(itm.type);
      else size = [itm.arylen * 16, itm.arylen * 16];

      tsize = chunk - size[0]; //How much of the chunk exists after taking the size of the data.

      //Chunk has been overdrawn when it already has some data resurved for it.
      if (tsize < 0 && chunk < 16) {
        offset += chunk; //Add Remaining Chunk to offset...
        if (chunk > 0) prevItm.chunkLen += chunk; //So the remaining chunk can be used by the last variable
        chunk = 16; //Reset Chunk
      } else if (tsize < 0 && chunk === 16) {
        //Do nothing incase data length is >= to unused chunk size.
        //Do not want to change the chunk size at all when this happens.
      } else if (tsize === 0) {
        //If evenly closes out the chunk, reset

        if (itm.type === "vec3" && chunk === 16) chunk -= size[1];
        //If Vec3 is the first var in the chunk, subtract size since size and alignment is different.
        else chunk = 16;
      } else chunk -= size[1]; //Chunk isn't filled, just remove a piece

      //Add some data of how the chunk will exist in the buffer.
      itm.offset = offset;
      itm.chunkLen = size[1];
      itm.dataLen = size[1];

      offset += size[1];
      prevItm = itm;
    }

    //Check if the final offset is divisiable by 16, if not add remaining chunk space to last element.
    //if(offset % 16 != 0){
    //ary[ary.length-1].chunkLen += 16 - offset % 16;
    //offset += 16 - offset % 16;
    //}
    return offset;
  }

  static debugVisualize(ubo: any) {
    let str = "",
      chunk = 0,
      tchunk = 0,
      i = 0,
      x,
      key,
      itm;

    console.log("======================================vDEBUG");
    console.log("Buffer Size : %d", ubo.bufferSize);
    for ([key, itm] of ubo.items) {
      console.log("Item %d : %s", i, key);
      chunk = itm.chunkLen / 4;
      for (x = 0; x < chunk; x++) {
        str += x === 0 || x === chunk - 1 ? "|." + i + "." : "|..."; //Display the index
        tchunk++;
        if (tchunk % 4 === 0) str += "| ~ ";
      }
      i++;
    }

    if (tchunk % 4 !== 0) str += "|";
    console.log(str);
  }

  static testShader(shader: Shader, ubo: Ubo, doBinding = false) {
    if (doBinding) shader.bind();
    if (!WonG.ctx) return;
    console.log("======================================TEST SHADER");

    var blockIdx = WonG.ctx.getUniformBlockIndex(shader.program, ubo.name);
    console.log("BlockIndex : %d", blockIdx);

    //Get Size of Uniform Block
    console.log(
      "Data Size : %d",
      WonG.ctx.getActiveUniformBlockParameter(
        shader.program,
        blockIdx,
        WonG.ctx.UNIFORM_BLOCK_DATA_SIZE
      )
    );

    console.log(
      "Indice ",
      WonG.ctx.getActiveUniformBlockParameter(
        shader.program,
        blockIdx,
        WonG.ctx.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES
      )
    );

    console.log(
      "Uniforms : %d",
      WonG.ctx.getActiveUniformBlockParameter(
        shader.program,
        blockIdx,
        WonG.ctx.UNIFORM_BLOCK_ACTIVE_UNIFORMS
      )
    );

    console.log(
      "Uniform Block Binding : ",
      WonG.ctx.getActiveUniformBlockParameter(
        shader.program,
        blockIdx,
        WonG.ctx.UNIFORM_BLOCK_BINDING
      )
    );

    if (doBinding) shader.unbind();
  }

  static outputLimits() {
    if (!WonG.ctx) return;
    console.log("======================================UboLimits");
    console.log(
      "MAX_UNIFORM_BUFFER_BINDINGS : %d",
      WonG.ctx.getParameter(WonG.ctx.MAX_UNIFORM_BUFFER_BINDINGS)
    );
    console.log(
      "MAX_UNIFORM_BLOCK_SIZE : %d",
      WonG.ctx.getParameter(WonG.ctx.MAX_UNIFORM_BLOCK_SIZE)
    );
    console.log(
      "MAX_VERTEX_UNIFORM_BLOCKS : %d",
      WonG.ctx.getParameter(WonG.ctx.MAX_VERTEX_UNIFORM_BLOCKS)
    );
    console.log(
      "MAX_FRAGMENT_UNIFORM_BLOCKS : %d",
      WonG.ctx.getParameter(WonG.ctx.MAX_FRAGMENT_UNIFORM_BLOCKS)
    );
  }
}

export default Ubo;
