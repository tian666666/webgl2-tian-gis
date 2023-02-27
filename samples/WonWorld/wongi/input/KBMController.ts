import WonG from "../gl";
import { Wongi } from "../Wongi";
import Camera from "../data/Camera";
import { Quat, Vec3 } from "../Maths";
interface ICoord {
  x: number;
  y: number;
  ix: number; //initial down values
  iy: number;
  idx: number; //Delta since inital
  idy: number;
  px: number; //previous value
  py: number;
  pdx: number; //Delta since previous
  pdy: number;
}
class KBMController implements EventListenerObject {
  canvas: HTMLCanvasElement;
  coord: ICoord;
  offsetX: number;
  offsetY: number;
  _activeHandler: any;
  _boundMouseMove: any;
  onMouseStart: any;
  _defaultHandler: any;
  _handlerStack: any[];
  _handlers: any;
  mouseDownType: number = -1;
  constructor() {
    this.canvas = (WonG.ctx as WebGL2RenderingContext)
      .canvas as HTMLCanvasElement;
    this.coord = {
      x: 0,
      y: 0,
      ix: 0, //initial down values
      iy: 0,
      idx: 0, //Delta since inital
      idy: 0,
      px: 0, //previous value
      py: 0,
      pdx: 0, //Delta since previous
      pdy: 0
    };

    //.............................
    const box = this.canvas.getBoundingClientRect();
    this.offsetX = box.left; //Help get X,Y in relation to the canvas position.
    this.offsetY = box.top;

    //.............................
    //Setup Mouse and Keyboard Event Listeners
    //this.canvas.addEventListener("mouseout",this.onMouseUp.bind(this));
    this._boundMouseMove = this.onMouseMove.bind(this); //Reused often, so save bound reference

    this.canvas.addEventListener("mousedown", this, false);
    this.canvas.addEventListener("mouseup", this, false);
    this.canvas.addEventListener("mousewheel", this, false);

    window.addEventListener("keydown", this, false);
    window.addEventListener("keyup", this, false);
    //.............................
    this.onMouseStart = null; //Optional, Allow the ability to swop event handlers or do whatever else before the evtHandlers do their job

    this._activeHandler = null; //Handlers are like state machines, swop functionality when needed
    this._handlers = new Map();
    this._handlerStack = [];
    this._defaultHandler = null;
  }
  handleEvent(evt: Event): void {
    switch (evt.type) {
      case "mousemove":
        this.onMouseMove(evt as MouseEvent);
        break;
      case "mousedown":
        this.onMouseDown(evt as MouseEvent);
        break;
      case "mouseup":
        this.onMouseUp(evt as MouseEvent);
        break;
      case "mousewheel":
        this.onMouseWheel(evt as WheelEvent);
        break;
      case "keydown":
        this.onKeyDown(evt as KeyboardEvent);
        break;
      case "keyup":
        this.onKeyUp(evt as KeyboardEvent);
        break;
    }
  }

  //------------------------------------------------------
  // Handler Stack
  stackSwitch(name: string, data: any) {
    if (this._activeHandler) this._handlerStack.push(this._activeHandler.name);
    this.switchHandler(name, data);
  }

  unStack() {
    if (this._handlerStack.length > 0) {
      //if we have a stacked item, switch to it.
      this.switchHandler(this._handlerStack.pop());
    } else if (
      this._activeHandler !== null &&
      this._activeHandler.name !== this._defaultHandler
    ) {
      this.switchHandler(this._defaultHandler, null);
    }
  }
  //endregion

  //------------------------------------------------------
  // Methods
  switchHandler(name: string, data?: any) {
    if (this._activeHandler.onDeactivate) this._activeHandler.onDeactivate();
    this._activeHandler = this._handlers.get(name);

    if (this._activeHandler.onActive) this._activeHandler.onActive(data);
    return this;
  }

  addHandler(name: string, h: any, active = false, isDefault = false) {
    h.name = name;
    this._handlers.set(name, h);

    if (active === true) this._activeHandler = h;

    return this;
  }

  //setMouseStart(d){ this.onMouseStart = d; return this; }
  //endregion

  //------------------------------------------------------
  // Mouse
  updateCoords(e: MouseEvent) {
    //Current Position
    this.coord.x = e.pageX - this.offsetX;
    this.coord.y = e.pageY - this.offsetY;
    console.log("更新pageX了吗", e.pageX);
    console.log("更新pageY了吗", e.pageY);
    //Change since last
    this.coord.pdx = this.coord.x - this.coord.px;
    this.coord.pdy = this.coord.y - this.coord.py;

    console.log("更新pdx了吗", this.coord.pdx);
    console.log("更新pdy了吗", this.coord.pdy);

    //Change Since Initial
    this.coord.idx = this.coord.x - this.coord.ix;
    this.coord.idy = this.coord.y - this.coord.iy;
  }

  onMouseWheel(e: WheelEvent, ctrl?: any, c?: any) {
    if (!this._activeHandler.onMouseWheel) return;

    e.preventDefault();
    e.stopPropagation();

    const delta = Math.max(-1, Math.min(1, -e.deltaY)); //Try to map wheel movement to a number between -1 and 1
    this._activeHandler.onMouseWheel(e, this, delta);
  }

  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // ix = initX; px = prevX; initY = iy; prevY = py;
    this.coord.ix = this.coord.px = this.coord.x = e.pageX - this.offsetX;
    this.coord.iy = this.coord.py = this.coord.y = e.pageY - this.offsetY;
    this.coord.pdx = this.coord.idx = this.coord.pdy = this.coord.idy = 0;

    this.mouseDownType = e.button;

    if (this.onMouseStart && this.onMouseStart(e, this, this.coord))
      return true;

    if (this._activeHandler.onMouseDown)
      this._activeHandler.onMouseDown(e, this, null); //  this.initX, this.initY

    this.canvas.addEventListener("mousemove", this._boundMouseMove);
  }

  onMouseMove(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.updateCoords(e);

    if (this._activeHandler.onMouseMove) {
      this._activeHandler.onMouseMove(e, this, this.coord);
    }

    //Copy Current to Previous
    this.coord.px = this.coord.x;
    this.coord.py = this.coord.y;
  }

  onMouseUp(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.updateCoords(e);

    this.canvas.removeEventListener("mousemove", this._boundMouseMove);
    if (this._activeHandler.onMouseUp)
      this._activeHandler.onMouseUp(e, this, this.coord);
  }
  //endregion

  //------------------------------------------------------
  // Keyboard
  onKeyDown(e: KeyboardEvent) {
    if (this._activeHandler.onKeyDown) {
      e.preventDefault();
      e.stopPropagation();
      this._activeHandler.onKeyDown(e, this, e.key);
    }
  }

  onKeyUp(e: KeyboardEvent) {
    if (this._activeHandler.onKeyUp) {
      e.preventDefault();
      e.stopPropagation();
      this._activeHandler.onKeyUp(e, this, e.key);
    }
  }
  //endregion
}

class CameraController {
  // camera: Camera;
  // rotRate: number;
  // panRate: number;
  // zoomRate: number;

  // yRotRate: number;
  // xRotRate: number;
  // xPanRate: number;
  // yPanRate: number;
  // zPanRate: number;

  kbForwardRate = -0.1;
  kbRotateRate = 0.04;

  mPanRate = 0.008;
  mLookRate = 0.002;
  mOrbitRate = 0.003;

  mode = 0;
  constructor(camera: Camera = Wongi.camera as Camera) {}

  onMouseWheel(e: MouseEvent, ctrl: KBMController, delta: any) {
    (Wongi.camera as Camera).addPosition(
      (Wongi.camera as Camera).forward(
        null,
        this.kbForwardRate * delta * (e.ctrlKey ? 5 : 1)
      )
    );
  }

  onMouseDown(e: MouseEvent, ctrl: KBMController, c: any) {
    if (e.shiftKey) this.mode = 0;
    else if (e.ctrlKey) this.mode = 2;
    else this.mode = 1;
  }

  onMouseMove(e: MouseEvent, ctrl: KBMController, c: any) {
    if (!Wongi.camera) return;
    switch (this.mode) {
      //------------------------------------ LOOK
      case 1:
        //Quaternion Way
        //var pos = Wongi.camera.getPosition()
        //			.add( Wongi.camera.left(null, c.pdx * this.mLookRate) )
        //			.add( Wongi.camera.up(null, c.pdy * -this.mLookRate) )
        //			.add( Wongi.camera.forward() )
        //			.sub( Wongi.camera.getPosition() );

        //Works just as good without local position as a starting point then
        //subtracting it to make a Direction vector
        //var pos = Wongi.camera.left(null, c.pdx * this.mLookRate)
        //			.add( Wongi.camera.up(null, c.pdy * -this.mLookRate) )
        //			.add( Wongi.camera.forward() );
        //Wongi.camera.rotation = Quat.lookRotation(pos, Vec3.UP);

        //Euler Way
        const euler = Quat.toEuler(Wongi.camera._rotation);
        euler[0] += c.pdy * this.mLookRate;
        euler[1] += c.pdx * this.mLookRate;

        Wongi.camera.rotation = Quat.fromEuler(
          null,
          euler[0],
          euler[1],
          0,
          "YZX"
        );
        break;

      //------------------------------------ Orbit
      case 2:
        //Rotate the camera around X-Z
        const pos = Wongi.camera.getPosition(),
          lenXZ = Math.sqrt(pos.x * pos.x + pos.z * pos.z),
          radXZ = Math.atan2(pos.z, pos.x) + this.mOrbitRate * c.pdx;

        pos[0] = Math.cos(radXZ) * lenXZ;
        pos[2] = Math.sin(radXZ) * lenXZ;

        //Then Rotate point around the the left axis
        const q = new Quat().setAxisAngle(
          Wongi.camera.left(),
          -c.pdy * this.mOrbitRate
        );
        Quat.rotateVec3(q, pos);

        //Save New Position, then update rotation
        Wongi.camera.position = pos;
        Wongi.camera.rotation = Quat.lookRotation(pos, Vec3.UP);
        break;

      //------------------------------------ Panning
      default:
        if (c.pdy != 0)
          Wongi.camera.addPosition(
            Wongi.camera.up(null, this.mPanRate * c.pdy)
          );
        if (c.pdx != 0)
          Wongi.camera.addPosition(
            Wongi.camera.left(null, this.mPanRate * -c.pdx)
          );
        break;
    }
  }

  onKeyDown(e: KeyboardEvent, ctrl: any, key: any) {
    if (!Wongi.camera) return;
    const ss = e.shiftKey ? 5.0 : 1.0;
    switch (key) {
      case "W":
      case "w":

      case "S":
      case "s":
        {
          const s =
            key === "S" || key === "s"
              ? this.kbForwardRate
              : -this.kbForwardRate;
          Wongi.camera.addPosition(Wongi.camera.forward(null, s * ss));
        }
        break; //S
      case "A":
      case "a":

      case "D":
      case "d":
        {
          const s =
            key === "D" || key === "d"
              ? -this.kbForwardRate
              : this.kbForwardRate;
          Wongi.camera.addPosition(Wongi.camera.left(null, s * ss));
        }
        break; //D
      case "Q":
      case "q":

      case "E":
      case "e":
        {
          const s =
            key == "E" || key === "e" ? -this.kbRotateRate : this.kbRotateRate;
          //Fungi.camera.mulRotationAxis(Fungi.camera.up(), s * ss);
          Wongi.camera.mulRotationAxis(Vec3.UP, s * ss);
        }
        break; //E
    }
  }
}

export { KBMController, CameraController };
