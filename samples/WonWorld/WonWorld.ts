/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-02-27 21:48:29
 * @LastEditors: tianyw
 */

import { Wongi } from "./wongi/Wongi";
import System from "./wongi/System";
import UVSphere from "./wongi/primitives/UVSphere";
import { LoadInlineShader } from "./wongi/Shader";
import Camera from "./wongi/data/Camera";
import Renderable from "./wongi/rendering/Renderable";
import WonG from "./wongi/gl";
import Transform from "./wongi/data/Transform";
import Points from "./wongi/primitives/Points";

//http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
//http://planetpixelemporium.com/planets.html

function run() {
  const resources = [
    { type: "shader", file: "./wongi/shaders/VecWColor.txt" },
    // { type: "shader", file: "./wongi/shaders/LowPolyPhong.txt" },
    {
      type: "image",
      name: "earthColor",
      file: "earth_color.jpg",
      doYFlip: true,
      useMips: false
    },
    {
      type: "image",
      name: "earthBump",
      file: "earth_bump.jpg",
      doYFlip: true,
      useMips: false
    },
    {
      type: "image",
      name: "earthNight",
      file: "earth_lights.jpg",
      doYFlip: true,
      useMips: false
    }
  ];
  System.beginWithResources(resources)
    .then(async () => {
      await System.startUp(onRender);
      System.darkScene();
      LoadInlineShader("inline_shader");
    })
    .then(() => onInit())
    .catch((err) => console.log("Catch", err));
}
let earth;
function onInit() {
  //........................
  (Wongi.camera as Camera).setPosition(0, 1, 2.5); //.setDegrees(-20,"x");

  //........................
  earth = new UVSphere("Planet").entity;
  Wongi.scene.add(earth.setScale(2).setPosition(0, 1, 0).setDegrees(210, "y"));

  //........................
  Wongi.loop.start();
}

function onRender(dt: number, ss: any) {
  // 转动 实时
  // earth.setDegrees(-10 * dt, "y");

  //..............................
  System.update();
}
run();
