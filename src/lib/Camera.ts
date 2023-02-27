import { vec3, mat4, vec4 } from "../common/math/TSM";
import { MathHelper } from "../common/math/MathHelper";
import { Frustum } from "./Frustum";
export enum ECameraType {
  FPSCAMERA, // 第一人称运动摄像机
  FLYCAMERA // 自由运动摄像机
}

export class Camera {
  public get fovY(): number {
    return this._fovY;
  }

  public set fovY(value: number) {
    this._fovY = value;
  }

  public get near(): number {
    return this._near;
  }

  public set near(value: number) {
    this._near = value;
  }

  public get far(): number {
    return this._far;
  }

  public set far(value: number) {
    this._far = value;
  }

  public get aspectRatio(): number {
    return this._aspectRatio;
  }

  public set aspectRatio(value: number) {
    this._aspectRatio = value;
  }

  public get position(): vec3 {
    return this._position;
  }

  public set position(value: vec3) {
    this._position = value;
  }

  public setViewport(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.gl.viewport(x, y, width, height);
    this.gl.scissor(x, y, width, height);
    this.aspectRatio = width / height;
  }

  public getViewport(): Int32Array {
    return this.gl.getParameter(this.gl.VIEWPORT);
  }

  //千万别用this.position.x = xxx，因为无法设置this._viewDirty
  //请用下面的三个set方法
  public set x(value: number) {
    this._position.x = value;
  }

  public set y(value: number) {
    this._position.y = value;
  }

  public set z(value: number) {
    this._position.z = value;
  }

  public get x(): number {
    return this._position.x;
  }

  public get y(): number {
    return this._position.y;
  }

  public get z(): number {
    return this._position.z;
  }

  public get xAxis(): vec3 {
    return this._xAxis;
  }

  public get yAxis(): vec3 {
    return this._yAxis;
  }

  public get zAxis(): vec3 {
    return this._zAxis;
  }

  public get type(): ECameraType {
    return this._type;
  }

  //比较特别，需要重新修正一些内容，或者直接禁止修改type
  public set type(value: ECameraType) {
    this._type = value;
  }

  public get left(): number {
    return this._left;
  }

  public get right(): number {
    return this._right;
  }

  public get bottom(): number {
    return this._bottom;
  }

  public get top(): number {
    return this._top;
  }
  // 提供一个 WebGLRenderingContext 的成员变量 这样可以直接和 WebGL 交互
  public gl: WebGLRenderingContext;

  public controlByMouse: boolean;

  public constructor(
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    fovY: number = 45.0,
    zNear: number = 1,
    zFar: number = 1000
  ) {
    this.gl = gl;
    this._aspectRatio = width / height; // 纵横比
    this._fovY = MathHelper.toRadian(fovY); // 摄像机默认 fovY 参数是以角度表示， TSM 数学库的 perspective 静态方法使用的是弧度表示，因此需要进行转换操作

    this._near = zNear;
    this._far = zFar;

    (this._top = this._near * Math.tan(this._fovY * 0.5)),
      (this._right = this._top * this._aspectRatio);
    this._bottom = -this._top;
    this._left = -this._right;
    this._frustum = new Frustum();
    // 初始化时，矩阵设置为单位矩阵
    this._projectionMatrix = new mat4();
    this._viewMatrix = new mat4();
    this._invViewMatrix = new mat4();
    this._viewProjMatrix = new mat4();
    this._invViewProjMatrix = new mat4();
    this.controlByMouse = false;
  }
  // 摄像机的更新
  // 当对摄像机进行移动或旋转操作时，或者改变投影的一些属性后，需要更新摄像机的视图矩阵和投影矩阵
  // 为了简单起见，这里并没有对这些操作进行优化，而是采取最简单直接的方式：每帧都自动计算相关矩阵
  public update(intervalSec: number): void {
    // 使用 mat4 的 perspective 静态方法计算投影矩阵
    this._projectionMatrix = mat4.perspective(
      this.fovY,
      this.aspectRatio,
      this.near,
      this.far
    );
    // 计算视图矩阵
    this._calcViewMatrix();
    // 使用 _projectionMatrix * _viewMatrix 顺序合成 _viewProjMatrix ，注意矩阵相乘的顺序
    mat4.product(
      this._projectionMatrix,
      this._viewMatrix,
      this._viewProjMatrix
    );
    this._viewProjMatrix.copy(this._invViewProjMatrix);
    // 然后再计算出 _viewProjMatrix 的逆矩阵
    this._viewProjMatrix.inverse(this._invViewProjMatrix);
  }

  //局部坐标系下的前后运动
  public moveForward(speed: number): void {
    // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动 y 轴上的数据
    if (this._type === ECameraType.FPSCAMERA) {
      this._position.x += this._zAxis.x * speed;
      this._position.z += this._zAxis.z * speed;
    } else {
        // 对于自由摄像机来说，它总是沿着当前的 z 轴方向前进或后退
      this._position.x += this._zAxis.x * speed;
      this._position.y += this._zAxis.y * speed;
      this._position.z += this._zAxis.z * speed;
    }
  }

  //局部坐标系下的左右运动
  public moveRightward(speed: number): void {
    // 对于第一人称摄像机来说，你双脚不能离地，因此运动时不能变动 y 轴上的数据
    if (this._type === ECameraType.FPSCAMERA) {
      this._position.x += this._xAxis.x * speed;
      this._position.z += this._xAxis.z * speed;
    } else {
         // 对于自由摄像机来说，它总是沿着当前的 x 轴方向左右运动
      this._position.x += this._xAxis.x * speed;
      this._position.y += this._xAxis.y * speed;
      this._position.z += this._xAxis.z * speed;
    }
  }

  //局部坐标系下的上下运动
  public moveUpward(speed: number): void {
     // 对于第一人称摄像机来说，只适调整上下的高度，目的是模拟眼睛的高度
    if (this._type === ECameraType.FPSCAMERA) {
      this._position.y += speed;
    } else {
        // 对于自由摄像机来说，它总是沿着当前的 y 轴方向上下运动
      this._position.x += this._yAxis.x * speed;
      this._position.y += this._yAxis.y * speed;
      this._position.z += this._yAxis.z * speed;
    }
  }

  //局部坐标轴的左右旋转摄像机，以角度表示
  public yaw(angle: number): void {
    // 重用矩阵
    mat4.m0.setIdentity();
    angle = MathHelper.toRadian(angle);
    // 调用 mat4 的 rotate 方法生成旋转矩阵，注意不同摄像机类型绕不同轴旋转
    if (this._type === ECameraType.FPSCAMERA) {
        // 对于 FPS 摄像机来说，总是水平旋转摄像机，避免产生斜视现象
      mat4.m0.rotate(angle, vec3.up);
    } else {
        // 对于自由摄像机来说，镜头可以任意倾斜
      mat4.m0.rotate(angle, this._yAxis);
    }
    // 对于绕 y 轴的旋转，会发现 y 轴不变，变动的是其他两个轴
    // 因此需要获取旋转 angle 后，另个两个轴的方向可以使用 multiplyVec3 方法实现
    mat4.m0.multiplyVec3(this._zAxis, this._zAxis);
    mat4.m0.multiplyVec3(this._xAxis, this._xAxis);
  }

  //局部坐标轴的上下旋转
  public pitch(angle: number): void {
    // 两种摄像机都可以使用 pitch 旋转
    mat4.m0.setIdentity();
    angle = MathHelper.toRadian(angle);
    mat4.m0.rotate(angle, this._xAxis);
    // 对于绕 x 轴的旋转，会发现 x轴不变，变动的是其他两个轴
    // 因此需要获取旋转 angle 后，另个两个轴的方向可以使用 multiplyVec3 方法实现
    mat4.m0.multiplyVec3(this._yAxis, this._yAxis);
    mat4.m0.multiplyVec3(this._zAxis, this._zAxis);
  }

  //局部坐标轴的滚转
  public roll(angle: number): void {
    // 只支持自由摄像机
    if (this._type === ECameraType.FLYCAMERA) {
      angle = MathHelper.toRadian(angle);
      mat4.m0.setIdentity();
      mat4.m0.rotate(angle, this._zAxis);
       // 对于绕 z 轴的旋转，会发现 z轴不变，变动的是其他两个轴
    // 因此需要获取旋转 angle 后，另个两个轴的方向可以使用 multiplyVec3 方法实现
      mat4.m0.multiplyVec3(this._xAxis, this._xAxis);
      mat4.m0.multiplyVec3(this._yAxis, this._yAxis);
    }
  }
  // calcViewMatrix 私有方法时通过摄像机的 position 和 3 个方向轴合成视图矩阵
  // lookAt 公开方法则使用摄像机的 位置 和世界坐标系中的任意一个点来构建视图矩阵（两个点确定一个方向），然后再从视图矩阵中抽取 x、y、z轴的信息，目的是为了实现摄像机的移动和旋转（因为摄像机的运动代码是建立在 position 和 3 个轴向量上的）

  //从当前postition和target获得view矩阵
  //并且从view矩阵抽取forward,up,right方向矢量
  public lookAt(target: vec3, up: vec3 = vec3.up): void {
    this._viewMatrix = mat4.lookAt(this._position, target, up);
    // 从摄像机矩阵中抽取世界坐标系中表示的3个轴
    // 使用世界坐标系表示的轴进行有向运动
    this._xAxis.x = this._viewMatrix.values[0];
    this._yAxis.x = this._viewMatrix.values[1];
    this._zAxis.x = this._viewMatrix.values[2];

    this._xAxis.y = this._viewMatrix.values[4];
    this._yAxis.y = this._viewMatrix.values[5];
    this._zAxis.y = this._viewMatrix.values[6];

    this._xAxis.z = this._viewMatrix.values[8];
    this._yAxis.z = this._viewMatrix.values[9];
    this._zAxis.z = this._viewMatrix.values[10];
  }

  public get viewMatrix(): mat4 {
    return this._viewMatrix;
  }

  public get invViewMatrix(): mat4 {
    return this._invViewMatrix;
  }

  public get projectionMatrix(): mat4 {
    return this._projectionMatrix;
  }

  public get viewProjectionMatrix(): mat4 {
    return this._viewProjMatrix;
  }

  public get invViewProjectionMatrix(): mat4 {
    return this._invViewProjMatrix;
  }

  public get frustum(): Frustum {
    return this._frustum;
  }

  //从当前轴以及postion合成view矩阵
  private _calcViewMatrix(): void {
    //固定forward方向
    this._zAxis.normalize();

    //forward cross right = up
    vec3.cross(this._zAxis, this._xAxis, this._yAxis);
    this._yAxis.normalize();

    //up cross forward = right  (cross：叉乘)
    vec3.cross(this._yAxis, this._zAxis, this._xAxis);
    this._xAxis.normalize();
    // 将世界坐标系表示的摄像机位置投影到摄像机的 3 个轴上
    let x: number = -vec3.dot(this._xAxis, this._position);
    let y: number = -vec3.dot(this._yAxis, this._position);
    let z: number = -vec3.dot(this._zAxis, this._position);
    // 合成视图矩阵（摄像机矩阵）
    this._viewMatrix.values[0] = this._xAxis.x;
    this._viewMatrix.values[1] = this._yAxis.x;
    this._viewMatrix.values[2] = this._zAxis.x;
    this._viewMatrix.values[3] = 0.0;

    this._viewMatrix.values[4] = this._xAxis.y;
    this._viewMatrix.values[5] = this._yAxis.y;
    this._viewMatrix.values[6] = this._zAxis.y;
    this._viewMatrix.values[7] = 0.0;

    this._viewMatrix.values[8] = this._xAxis.z;
    this._viewMatrix.values[9] = this._yAxis.z;
    this._viewMatrix.values[10] = this._zAxis.z;
    this._viewMatrix.values[11] = 0.0;

    this._viewMatrix.values[12] = x;
    this._viewMatrix.values[13] = y;
    this._viewMatrix.values[14] = z;
    this._viewMatrix.values[15] = 1.0;

    //求view的逆矩阵，也就是世界矩阵
    this._viewMatrix.inverse(this._invViewMatrix);
    this._frustum.buildFromCamera(this);
  }

  private _type: ECameraType = ECameraType.FLYCAMERA; // 摄像机类型

  private _position: vec3 = new vec3(); // 摄像机在世界坐标系中的位置 初始化时未世界坐标系的原点处
  private _xAxis: vec3 = new vec3([1, 0, 0]); // 摄像机在世界坐标系中的 x 轴方向
  private _yAxis: vec3 = new vec3([0, 1, 0]); // 摄像机在世界坐标系中的 y 轴方向
  private _zAxis: vec3 = new vec3([0, 0, 1]); // 摄像机在世界坐标系中的 z 轴方向

  private _near: number; // 投影的近平面距离
  private _far: number; // 投影的远平面距离
  private _left: number;
  private _right: number;
  private _bottom: number;
  private _top: number;

  private _fovY: number; // 上下视场角的大小，内部由弧度表示，输入时由角度表示
  private _aspectRatio: number; // 视野的纵横比

  private _projectionMatrix: mat4; // 每帧更新时会根据上述参数计算出投影矩阵
  private _viewMatrix: mat4; // 每帧更新时会根据上述参数计算出视图矩阵
  private _invViewMatrix: mat4;
  // 投影矩阵 * 摄像机矩阵以及其逆矩阵
  private _viewProjMatrix: mat4; // 每帧更新时会计算出 view_matrix 矩阵及其逆矩阵
  private _invViewProjMatrix: mat4;

  private _frustum: Frustum;
}
