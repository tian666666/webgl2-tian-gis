/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-18 23:11:55
 * @LastEditTime: 2023-02-19 10:43:57
 * @LastEditors: tianyw
 */
import WonG from "../gl";
import { Wongi } from "../Wongi";
import Transform from "../data/Transform";
import Mat3 from "../maths/Mat3";
import { Mat4 } from "../Maths";

class Renderable extends Transform {
  drawMode: number;
  vao: any;
  material: any;
  normalMatrix: Mat3 | null;
  options: any;
  constructor(name: string, vao: any, matName: string | null = null) {
    super();
    this.name = name;
    this.vao = vao;

    //this.drawOrder		= 10;
    this.drawMode = (WonG.ctx as WebGL2RenderingContext).TRIANGLES;
    this.material = null;
    this.normalMatrix = null;

    this.options = { cullFace: true };

    if (matName) this.setMaterial(matName);
  }

  updateMatrix() {
    const isUpdated = super.updateMatrix();

    //Calcuate the Normal Matrix which doesn't need translate
    //but needs to apply transpose and inverses the mat4 to mat3
    if (isUpdated && this.normalMatrix)
      Mat4.normalMat3(this.normalMatrix, this.worldMatrix);

    return isUpdated;
  }

  setMaterial(matName: string) {
    this.material = matName ? Wongi.getMaterial(matName) : null;

    //If the shader reqires normal matrix, set it up to be updated when transformations are calculated.
    if (
      !this.normalMatrix &&
      this.material &&
      this.material.shader.options.normalMatrix
    ) {
      this.normalMatrix = new Mat3();
    }

    return this;
  }
  //enableNormals(){		this.normalMatrix	= new Float32Array(9);			return this; }

  //clone(){
  //	var o = new Renderable(this.vao,null);
  //	o.useCulling	= this.useCulling;
  //	o.useDepthTest	= this.useDepthTest;
  //	o.useNormals	= this.useNormals;
  //	o.drawMode		= this.drawMode;
  //	o.material		= this.material;
  //	return o;
  //}

  //draw(render){
  //	if(this.vao.elmCount == 0) return;
  //	render.drawRenderable(this);
  //}
}

export default Renderable;
