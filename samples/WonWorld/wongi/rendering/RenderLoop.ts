/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-18 23:11:55
 * @LastEditTime: 2023-02-18 23:12:57
 * @LastEditors: tianyw
 */
import { Wongi } from "../Wongi";

interface ICallbackTwoParams<T1, T2> {
  (params1: T1, params2: T2): void;
}
class RenderLoop {
  _callBack: ICallbackTwoParams<number, number>;
  isActive: boolean;
  fps: number;
  _startTime: number;
  _lastFrame: number | null;
  _frameCaller: any;
  _fpsLimit: number;
  _runPtr: any;
  _fpsLast: any;
  _fpsCnt: number;
  constructor(callback: ICallbackTwoParams<number, number>, fps = 0) {
    this.isActive = false; //Control the On/Off state of the render loop
    this.fps = 0; //Save the value of how fast the loop is going.

    this._startTime = 0;
    this._lastFrame = null; //The time in Miliseconds of the last frame.
    this._callBack = callback; //What function to call for each frame
    this._frameCaller = window; //Normally we'll call window's requestAnimationFrame, but for VR we need to use its HMD reference for that call.
    this._fpsLimit = 0; //Limit how many frames per second the loop should do.
    this._runPtr = null; //Pointer to a run function that has this class's scope attached

    this._fpsLast = null; //Track time last FPS value was reported
    this._fpsCnt = 0; //Constant count of how many frames have been rendered.

    this.setFPSLimit(fps > 0 ? fps : 0);
  }

  stop() {
    this.isActive = false;
  }
  start() {
    this.isActive = true;

    this._startTime = this._lastFrame = this._fpsLast = performance.now();

    this._frameCaller.requestAnimationFrame(this._runPtr);
    return this;
  }

  setFrameCaller(fc: any) {
    this._frameCaller = fc;
    return this;
  }
  setFPSLimit(v: number) {
    if (v <= 0) {
      this._fpsLimit = 0;
      this._runPtr = this.runFull.bind(this);
    } else {
      this._fpsLimit = 1000 / v; //Calc how many milliseconds per frame in one second of time.
      this._runPtr = this.runLimit.bind(this);
    }
  }

  runLimit() {
    //Calculate Deltatime between frames and the FPS currently.
    const msCurrent = performance.now(),
      msDelta = msCurrent - (this._lastFrame as number),
      deltaTime = parseFloat((msDelta * 0.001).toFixed(3)), //What fraction of a single second is the delta time
      sinceStart = parseFloat(
        ((msCurrent - this._startTime) * 0.001).toFixed(3)
      );

    if (msDelta >= this._fpsLimit) {
      //Now execute frame since the time has elapsed.
      this.fps = Math.floor(1 / deltaTime);
      this._lastFrame = msCurrent;

      Wongi.deltaTime = deltaTime;
      Wongi.sinceStart = sinceStart;

      this._callBack(deltaTime, sinceStart);
    }

    if (this.isActive) this._frameCaller.requestAnimationFrame(this._runPtr);
  }

  runFull() {
    //Calculate Deltatime between frames and the FPS currently.
    const msCurrent = performance.now(), //Gives you the whole number of how many milliseconds since the dawn of time :)
      deltaTime = parseFloat(
        ((msCurrent - (this._lastFrame as number)) * 0.001).toFixed(3)
      ), //ms between frames, Then / by 1 second to get the fraction of a second.
      sinceStart = parseFloat(
        ((msCurrent - this._startTime) * 0.001).toFixed(3)
      );

    Wongi.deltaTime = deltaTime;
    Wongi.sinceStart = sinceStart;

    //Track how my frames have passed in one second of time.
    this._fpsCnt++;
    if (msCurrent - this._fpsLast >= 1000) {
      this.fps = this._fpsCnt;
      this._fpsCnt = 0;
      this._fpsLast = msCurrent;
    }

    //Now execute frame since the time has elapsed.
    //this.fps			= Math.floor(1/deltaTime); //Time it took to generate one frame, divide 1 by that to get how many frames in one second.
    this._lastFrame = msCurrent;
    this._callBack(deltaTime, sinceStart);
    if (this.isActive) this._frameCaller.requestAnimationFrame(this._runPtr);
  }
}

export default RenderLoop;
