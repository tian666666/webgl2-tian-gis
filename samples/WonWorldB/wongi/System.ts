import WonG from "./gl";
import Ubo from "./Ubo";
import { Wongi } from "./Wongi";
import Camera from "./data/Camera";
import Renderer from "./rendering/Renderer";
import RenderLoop from "./rendering/RenderLoop";
import Scene from "./rendering/Scene";
import { Mat4 } from "./Maths";
import Downloader from "./net/Downloader";
import Loader from "./data/Loader";
import GridFloor from "./primitives/GridFloor";
import { KBMController, CameraController } from "./input/KBMController";

class System {
  static UBOTransform: Ubo | null = null; //Save reference, so no need to request it from Wongi in render loop
  static GlobalTime: Float32Array = new Float32Array([0]); //Allocate this once for UBO and reuse for renderloop

  //Setup GL Canvas and Uniform Blocks
  static gl_init() {
    //.........................................
    // Get GL Context
    if (!WonG.init("WongiCanvas")) throw new Error("Unable to load canvas");

    //.........................................
    //Build UBOs
    System.UBOTransform = new Ubo("UBOTransform", 0)
      .addItem("projViewMatrix", "mat4")
      .addItem("cameraPos", "vec3")
      .addItem("globalTime", "float")
      .addItem("screenSize", "vec2")
      .finalize(false)
      .updateItem("screenSize", new Float32Array([WonG.width, WonG.height]))
      // .updateItem("matProjection", (Wongi.camera as Camera).projectionMatrix)
      .unbind();
  }

  //Begin the startup Process by downloading resources
  static async beginWithResources(dlAry: any) {
    //.........................................
    // Download Modules for Download and Loading support
    // let Downloader, Loader;
    // await Promise.all([
    // 	import("./net/Downloader.js").then( mod=>{ Downloader = mod.default; }),
    // 	import("./data/Loader.js").then( mod=>{ Loader = mod.default; })
    // ]);

    //.........................................
    const dl = new Downloader(dlAry),
      isOk = await dl.start();

    if (!isOk) throw new Error("Error Downloading");

    if (WonG.ctx === null) System.gl_init();

    //....................................
    //Load Up Shaders
    const arySnippets = Loader.getSnippets(dl.complete),
      aryShaders = Loader.parseShaders(dl.complete, arySnippets);

    if (aryShaders === null) throw new Error("Problems parsing shader text");

    if (!Loader.compileShaders(aryShaders))
      throw new Error("Failed compiling shaders");

    //....................................
    //Load Textures
    Loader.textures(dl.complete);

    //....................................
    //Load Materials
    Loader.materials(aryShaders);

    return true;
  }

  static darkScene() {
    WonG.setClearColor("505050");

    for (let itm of Wongi.scene.items) {
      if (itm.name === "GridFloor") {
        itm.setMaterial("MatGridFloorDark");
        break;
      }
    }
  }

  /* Start up the system
		Opt 1 == GridFloor()
		Opt 2 == KBM with Camera Controller
	*/
  // 这里的 startUp 等于 Fungi 的 ready 方法
  static async startUp(onRender: any, opt = 3) {
    if (WonG.ctx === null) System.gl_init();

    //.........................................
    // wongi.camera 就等于 Fungi 的 this.mainCamera
    Wongi.camera = new Camera().setPerspective();
    Wongi.render = new Renderer();
    Wongi.scene = new Scene();

    if (onRender) Wongi.loop = new RenderLoop(onRender);

    //.........................................
    if ((opt & 1) === 1) {
      // await import("./primitives/GridFloor.js").then(
      // 	mod=>{ Wongi.scene.add( mod.default() ); }
      // );
      Wongi.scene.add(GridFloor());
    }

    //.........................................
    if ((opt & 2) === 2) {
      // await import("./input/KBMController.js").then(
      // 	mod=>{
      // 		Wongi.controller = new mod.KBMController();
      // 		Wongi.controller.addHandler("camera", new mod.CameraController(), true, true );
      // 	}
      // );
      // wongi.controller 就等于 Fungi 的 this.ctralCamera
      Wongi.controller = new KBMController();
      Wongi.controller.addHandler("camera", new CameraController(Wongi.camera), true, true);
    }
  }

  //prepare scene and render frame
  static update() {
    //..............................................
    //Update Camera and UBO
    (Wongi.camera as Camera).updateMatrix();
    System.GlobalTime[0] = Wongi.sinceStart;
    const matProjView = new Mat4();
    Mat4.mult(matProjView,(Wongi.camera as Camera).projectionMatrix,(Wongi.camera as Camera).invertedWorldMatrix);
    (System.UBOTransform as Ubo)
      .bind()
      .updateItem("projViewMatrix", matProjView)
      .updateItem("cameraPos", (Wongi.camera as Camera)._position)
      .updateItem("globalTime", System.GlobalTime) //new Float32Array([Wongi.sinceStart])
      .unbind();

    //..............................................
    Wongi.render.drawScene(Wongi.scene.items);
  }
}

export default System;
