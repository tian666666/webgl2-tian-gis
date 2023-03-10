import WonG from "../gl";
import Vao from "../Vao";
import Renderable from "../rendering/Renderable";

class UVSphere {
  entity: Renderable;
  constructor(matName: string, name = "UVSphere") {
    const d = UVSphere.vertData(),
      vao = Vao.standardRenderable(
        name,
        3,
        d.vertices,
        d.normals,
        d.uv,
        d.index
      );
    this.entity = new Renderable(name, vao, matName);

    this.entity.drawMode = (WonG.ctx as WebGL2RenderingContext).TRIANGLE_STRIP;
  }

  static vertData() {
    const yLen = 18,
      xLen = 18,
      radius = 0.5;

    const aVert = [],
      aNorm = [],
      aUV = [],
      aIndex = [];

    //...........................................
    // Create Vertex and its Attributes (UV,Norms)
    let xp,
      yp,
      zp,
      mag,
      yRad = Math.PI, // Look Angles
      xRad = Math.PI * 2,
      yInc = Math.PI / yLen, // Loop Increment
      xInc = (Math.PI * 2) / xLen,
      xUV = 1 / xLen, // UV Increment
      yUV = 1 / yLen;

    for (let x = 0; x <= xLen; x++) {
      yRad = Math.PI;
      for (let y = 0; y <= yLen; y++) {
        //---------------------------
        //Calculate the vertex position based on the polar coord
        xp = radius * Math.sin(yRad) * Math.cos(xRad);
        yp = radius * Math.cos(yRad);
        zp = radius * Math.sin(yRad) * Math.sin(xRad); // Y & Z are flipped.

        aVert.push(xp, yp, zp);

        //Calc the normal direction.
        mag = 1 / Math.sqrt(xp * xp + yp * yp + zp * zp);
        aNorm.push(xp * mag, yp * mag, zp * mag);
        //Fungi.debugLine.addRawLine(xp, yp, zp,0, xp*mag, yp*mag, zp*mag,0);

        //---------------------------
        //Calc the vertex's UV value
        aUV.push(
          //(x < xLen) ? x * xUV : 1,
          //(y < yLen) ? y * yUV : 1
          x * xUV,
          y * yUV
        );
        //---------------------------
        //Move onto the next Latitude position
        yRad -= yInc;
      }
      xRad -= xInc; //Move onto the next Longitude
    }

    //...........................................
    // Triangulate all the vertices for Triangle Strip
    let iLen = xLen * (yLen + 1);
    for (let i = 0; i < iLen; i++) {
      xp = Math.floor(i / (yLen + 1)); //Current longitude
      yp = i % (yLen + 1); //Current latitude

      //Column index of row R and R+1
      aIndex.push(xp * (yLen + 1) + yp, (xp + 1) * (yLen + 1) + yp);

      //Create Degenerate Triangle, Last AND first index of the R+1 (next row that becomes the top row )
      if (yp === yLen && i < iLen - 1)
        aIndex.push((xp + 1) * (yLen + 1) + yp, (xp + 1) * (yLen + 1));
    }
    return { vertices: aVert, normals: aNorm, uv: aUV, index: aIndex };
  }
}
export default UVSphere;
