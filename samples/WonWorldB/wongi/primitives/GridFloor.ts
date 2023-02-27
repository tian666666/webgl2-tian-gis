/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-02-18 23:10:09
 * @LastEditTime: 2023-02-18 23:53:57
 * @LastEditors: tianyw
 */
import WonG from "../gl";
import Vao from "../Vao";
import Renderable from "../rendering/Renderable";

function GridFloor() {
  const GridSize = 0.2, //Distance between lines
    len = 70, //How many lines to generate
    t = len * GridSize; //Total Size of grid
  let p = 0, //Position
    v = []; //Vertex Array

  for (let i = 1; i <= len; i++) {
    //build grid
    p = i * GridSize;
    v.push(
      p,
      0,
      t,
      0,
      p,
      0,
      -t,
      0,
      -p,
      0,
      t,
      0,
      -p,
      0,
      -t,
      0,
      -t,
      0,
      p,
      0,
      t,
      0,
      p,
      0,
      -t,
      0,
      -p,
      0,
      t,
      0,
      -p,
      0
    );
  }
  v.push(-t, 0.007, 0, 1, t, 0.007, 0, 1, 0, 0.007, t, 2, 0, 0.007, -t, 2); //origin x,z lines

  const vao = Vao.standardRenderable("GridFloor", 4, v),
    model = new Renderable("GridFloor", vao, "MatGridFloor");

  model.name = "GridFloor";
  model.drawMode = (WonG.ctx as WebGL2RenderingContext).LINES;
  return model;
}

export default GridFloor;
