/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-05 22:03:25
 * @LastEditTime: 2023-02-06 23:37:04
 * @LastEditors: tianyw
 */
import { WebGLApplication } from "../webgl/WebGLApplication";
import { CanvasKeyBoardEvent, CanvasMouseEvent } from "../common/Application";
import { Camera } from "./Camera";
import { vec2 } from "../common/math/TSM";

export class CameraApplication extends WebGLApplication {
  public camera: Camera; // 在WebGLApplication的基础上增加了对摄像机系统的支持

  public constructor(
    canvas: HTMLCanvasElement,
    contextAttributes: WebGLContextAttributes = { premultipliedAlpha: false },
    need2d: boolean = false
  ) {
    super(canvas, contextAttributes, need2d);
    this.camera = new Camera(this.gl, canvas.width, canvas.height, 45, 1, 2000);
    this.camera.z = 4;
  }

  //子类override update函数时必须要调用基类本方法
  public update(elapsedMsec: number, intervalSec: number): void {
    // 调用Camera对象的update，这样就能实时的计算camera的投影和视图矩阵
    // 这样才能保证摄像机正确运行
    // 如果CameraApplication的子类覆写（override）本函数
    // 那么必须在函数的最后一句代码调用: super.update(elapsedMsec,intervalSec)
    this.camera.update(intervalSec);
  }

  // 内置一个通用的摄像机按键事件响应操作
  // 覆写（）
  public onKeyPress(evt: CanvasKeyBoardEvent): void {
    if (evt.key === "w") {
      this.camera.moveForward(-1); // 摄像机向前运行
    } else if (evt.key === "s") {
      this.camera.moveForward(1); // 摄像机向后运行
    } else if (evt.key === "a") {
      this.camera.moveRightward(1); // 摄像机向右运行
    } else if (evt.key === "d") {
      this.camera.moveRightward(-1); // 摄像机向左运行
    } else if (evt.key === "z") {
      this.camera.moveUpward(1); // 摄像机向上运行
    } else if (evt.key === "x") {
      this.camera.moveUpward(-1); // 摄像机向下运行
    } else if (evt.key === "y") {
      this.camera.yaw(1); // 摄像机绕本身的Y轴旋转
    } else if (evt.key === "r") {
      this.camera.roll(1); // 摄像机绕本身的Z轴旋转
    } else if (evt.key == "p") {
      this.camera.pitch(1); // 摄像机绕本身的X轴旋转
    }
  }
  // 覆写
  public onMouseWheel(evt: CanvasMouseEvent): void {
    if (evt.event as WheelEvent) {
      const wheelY = -(evt.event as WheelEvent).deltaY;
      if (wheelY > 0) {
        this.camera.moveForward(1); // 摄像机向前运行
      } else {
        this.camera.moveForward(-1); // 摄像机向前运行
      }
    }
  }

  private startDrag: vec2 = new vec2([0, 0]);
  public onMouseUp(evt: CanvasMouseEvent): void {
    this.startDrag = evt.canvasPosition;
  }

  // 覆写 onMouseDrag
  public onMouseDrag(evt: CanvasMouseEvent): void {
    const endDrag = evt;
    console.log("移动X：", evt.mouseMoveX);
    console.log("移动Y：", evt.mouseMoveY);
    // 此处为递增和递减的方式：若要回到原位置，则需要记录

    if (evt.mouseMoveX > 0) {
      this.camera.moveRightward(-0.01); // 摄像机向右运行
    } else {
      this.camera.moveRightward(0.01); // 摄像机向左运行
    }
    if (evt.mouseMoveY > 0) {
      this.camera.moveUpward(0.01); // 摄像机向上运行
    } else {
      this.camera.moveUpward(-0.01); // 摄像机向下运行
    }
  }
}
