import { vec2 } from "./math/TSM";

export enum EInputEventType {
  MOUSEEVENT, //总类，表示鼠标事件
  MOUSEDOWN, //鼠标按下事件
  MOUSEUP, //鼠标弹起事件
  MOUSEMOVE, //鼠标移动事件, move事件发生在当前鼠标指针之下的ISprite对象
  MOUSEDRAG, //鼠标拖动事件, drag事件发生在mouseDown选中的ISprite对象上
  MOUSEWHEEL, // 鼠标滚动事件
  KEYBOARDEVENT, //键盘事件
  KEYUP, //总类，键按下事件
  KEYDOWN, //键弹起事件
  KEYPRESS, //按键事件

  // 移动端事件
  TOUCHSTART, //手指触摸到屏幕会触发
  TOUCHMOVE, // 当手指在屏幕上移动时，会触发
  TOUCHEEND, // 当手指离开屏幕时，会触发
  TOUCHCANCEL, // 当由系统进行的触发，比如手持触摸屏幕的时候，突然 alert 了一下，或系统中其他打断了 touch 的行为，则可以触发该事件

  TAP, // 手指碰一下屏幕会触发
  LONGTAP, // 手指长按屏幕会触发
  SINGLETAP, // 手指碰一下屏幕会触发
  DOUBLETAP, // 手指双击屏幕会触发

  SWIPE, // 手指在屏幕上滑动时会触发
  SWIPELEFT, // 手指在屏幕上向左滑动时会触发
  SWIPERIGHT, // 手指在屏幕上向右滑动时会触发
  SWIPEUP, // 手指在屏幕上向上滑动时会触发
  SWIPEDOWN // 手指在屏幕上向下滑动时会触发
}

// Application 类除了不间断地基于时间的更新与重绘封装外，还有一个很重要的功能就是对输入事件的分发和响应机制
// 输入包括鼠标事件和键盘事件

// CanvasKeyboardEvent和CanvasMouseEvent都继承自本类
// 基类定义了共同的属性，keyboard或mouse事件都能使用组合键
// 例如你可以按着ctrl键的同时点击鼠标左键做某些事情
// 当然你也可以按着alt + a 键做另外一些事情
export class CanvasInputEvent {
  // 三个boolean变量，用来指示alt / ctrl / shift是否被按下
  public altKey: boolean;
  public ctrlKey: boolean;
  public shiftKey: boolean;

  // type是一个枚举对象，用来表示当前的事件类型
  public type: EInputEventType;

  // 构造函数，使用了default参数
  public constructor(
    type: EInputEventType,
    altKey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false
  ) {
    this.altKey = altKey;
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.type = type;
  }
}

// 在 Application 中使用 requestAnimationFrame 来驱动动画不停更新和重绘
// 该函数与屏幕刷新频率一致（如16..66毫秒，每秒60帧）的速度不停重复循环
// 但有时候，可能还要执行其他任务（如三角形的旋转及立方体定时替换纹理操作），或者想在某个时间点仅仅执行一次任务
// 像这些任务，并不需要以每秒 60 帧的速度执行，也就是说需要既可以不同频率来执行同一个任务，也可以倒计时方式执行一次任务
// 定时器设计目标：
// 1、Application 能够同时触发多个定时器
// 2、每个定时器可以以不同帧率来重复执行任务
// 3、每个定时器可以倒计时方式执行一次任务
// 4、尽量地让内存使用与运行效率达到相对平衡
// 要实现上述 4 个目标，需要 Timer 类和 Application 类相互配合

// 回调函数类型别名
// 回调函数需要第三方实现和设置，所有导出该回调函数
export type TimerCallback = (id: number, data: any) => void;

// 纯数据类
// 我们不需要导出Timer类，因为只是作为内部类使用，Application 提供的公开方法时以 Timer 的 id 号来操作 Timer
class Timer {
  public id: number = -1; // 计时器的id号

  // 标记当前计时器是否有效，很重要的一个变量，具体看后续代码
  public enabled: boolean = false;

  public callback: TimerCallback; // 回调函数，到时间会自动调用
  public callbackData: any = undefined; // 用作回调函数的参数

  public countdown: number = 0; // 倒计时器，每次update时会倒计时
  public timeout: number = 0; //
  public onlyOnce: boolean = false;

  constructor(callback: TimerCallback) {
    this.callback = callback;
  }
}

export class CanvasMouseEvent extends CanvasInputEvent {
  // button表示当前按下鼠标哪个键
  // [ 0 : 鼠标左键 ，1 ： 鼠标中键，2 ： 鼠标右键]
  public button: number;
  public event: MouseEvent;
  // 基于canvas坐标系的表示
  public canvasPosition: vec2;
  public mouseMoveX: number;
  public mouseMoveY: number;

  public constructor(
    event: MouseEvent,
    type: EInputEventType,
    canvasPos: vec2,
    button: number,
    mouseMoveX: number,
    mouseMoveY: number,
    altKey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false
  ) {
    super(type, altKey, ctrlKey, shiftKey);
    this.canvasPosition = canvasPos;
    this.button = button;
    this.event = event;
    this.mouseMoveX = mouseMoveX;
    this.mouseMoveY = mouseMoveY;
    console.log(this.button);
  }
}

export class CanvasKeyBoardEvent extends CanvasInputEvent {
  // 当前按下的键的ascii字符
  public key: string;
  // // 当前按下的键的ascii码（数字）
  // public keyCode: number;
  // 当前按下的键是否不停的触发事件
  public repeat: boolean;

  // public constructor ( type: EInputEventType, key: string, keyCode: number, repeat: boolean, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false )
  public constructor(
    type: EInputEventType,
    key: string,
    repeat: boolean,
    altKey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false
  ) {
    super(type, altKey, ctrlKey, shiftKey);
    this.key = key;
    // this.keyCode = keyCode;
    this.repeat = repeat;
  }
}

// Application 大部分成员变量都是使用了 protected 访问修饰符，意味着 Application 本类及继承自 Application 的子类都能访问这些成员变量
// 作为一个经验，如果设计的类能够被继承、被扩展的话，并且只需子类来访问这些成员变量，那么最好将成员变量声明为 protected
// Application 框架系统主要做 3 件事情：更新、重绘、事件的分发或处理，其中 更新和重回需要不间断地重复。
// 此时最好的方式是使用 HTML DOM（文档对象模型）中的 requestAnimationFrame 方法
// 由于图形程序在渲染时需要加载资源（例如从服务器加载图像或文件）并且需要在加载后才能进行更新和渲染
// 因此将这个流程分解为 Application 的启动（start/run）、查询（isRunning）、不间断的刷新（step，包含更新与重绘）及停止（stop）这 4 个操作
// EventListenerObject 是 lib.dom.d.ts 库中预先定义的接口，需要实现签名方法 handleEvent，系统会自动调用该接口方法并将相关信息从参数 evt 中传递
export class Application implements EventListenerObject {
  public timers: Timer[] = []; // 用于存储、操作定时器

  private _timeId: number = -1; // id 从 0 开始时有效 id，负数是无效 id 值 用 id 号操作定时器

  private _fps: number = 0;

  public isFlipYCoord: boolean = false; // 如何计算 Y 轴的坐标：当我们移动鼠标时，获得的坐标（x,y）的值是相对于浏览器左上角的偏移量，而 WebGL 中需要的是相对于左下角的偏移量

  // 我们的Application主要是canvas2D和webGL应用
  // 而canvas2D和webGL context都是从HTMLCanvasElement元素获取的
  public canvas: HTMLCanvasElement;

  // 本项目中的Demo以浏览器为主
  // 我们对于mousemove事件提供一个开关变量
  // 如果下面变量设置为true，则每次鼠标移动都会触发mousemove事件
  // 否则我们就不会触发m
  public isSupportMouseMove: boolean;

  // 我们使用下面变量来标记当前鼠标是否按下状态
  // 目的是提供mousedrag事件
  protected _isMouseDown: boolean;
  protected _isRightMouseDown: boolean = false; // 为了支持鼠标按下drag事件

  // _start成员变量用于标记当前Application是否进入不间断的循环状态
  protected _start: boolean = false;
  // 由Window对象的requestAnimationFrame返回的大于0的id号
  // 我们可以使用cancelAnimationFrame ( this ._requestId )来取消动画循环
  protected _requestId: number = -1;

  // 由于计算当前更新与上一次更新之间的时间差
  // 用于基于时间的物理更新
  protected _lastTime!: number;
  protected _startTime!: number;

  // 声明每帧回调函数
  public frameCallback: ((app: Application) => void) | null;

  public constructor(canvas: HTMLCanvasElement) {
    // Application基类拥有一个HTMLCanvasElement对象
    // 这样子类可以分别从该HTMLCanvasElement中获取Canvas2D或WebGL上下文对象
    this.canvas = canvas;

    // canvas元素能够监听鼠标事件
    this.canvas.addEventListener("mousedown", this, false);
    this.canvas.addEventListener("mouseup", this, false);
    this.canvas.addEventListener("mousemove", this, false);
    this.canvas.addEventListener("mousewheel", this, false);

    // 很重要一点，键盘事件不能在canvas中触发，但是能在全局的window对象中触发
    // 因此我们能在window对象中监听键盘事件
    window.addEventListener("keydown", this, false);
    window.addEventListener("keyup", this, false);
    window.addEventListener("keypress", this, false);

    // 初始化时，mouseDown为false
    this._isMouseDown = false;

    // 默认状态下，不支持mousemove事件
    this.isSupportMouseMove = false;

    this.frameCallback = null;

    document.oncontextmenu = function () {
      return false;
    }; // 禁止右键上下文菜单
  }

  // 判断当前Application是否一直在调用requestAnimationFrame
  public isRunning(): boolean {
    return this._start;
  }

  // 计算当前的FPS（Frame Per Second）
  public get fps() {
    return this._fps;
  }

  // 启动动画循环
  public start(): void {
    if (this._start === false) {
      this._start = true;
      //this . _requestId = -1 ; // 将_requestId设置为-1
      // 在start和stop函数中，_lastTime和_startTime都设置为-1
      this._lastTime = -1;
      this._startTime = -1;
      // 启动更新渲染循环

      this._requestId = requestAnimationFrame((msec: number): void => {
        // 启动step方法
        this.step(msec);
      });

      //注释掉上述代码，使用下面代码来启动step方法
      //this . _requestId = requestAnimationFrame ( this . step . bind ( this ) ) ;
    }
  }

  // 不停的周而复始运动: 不间断地刷新（step）
  // 不间断地刷新分解为 4 个路程：计算帧率（FPS）、更新（update）、render（重绘）及按需逐帧回调（frameCallback）。
  protected step(timeStamp: number): void {
    //第一次调用本函数时，设置start和lastTime为timestamp
    if (this._startTime === -1) this._startTime = timeStamp;
    if (this._lastTime === -1) this._lastTime = timeStamp;

    //计算当前时间点与第一次调用step时间点的差
    let elapsedMsec = timeStamp - this._startTime;

    //计算当前时间点与上一次调用step时间点的差(可以理解为两帧之间的时间差)
    // 此时intervalSec实际是毫秒表示
    let intervalSec = timeStamp - this._lastTime;

    // 第一帧的时候,intervalSec为0,防止0作分母
    if (intervalSec !== 0) {
      // 计算fps
      this._fps = 1000.0 / intervalSec;
    }

    // 我们update使用的是秒为单位，因此转换为秒表示
    intervalSec /= 1000.0;

    //记录上一次的时间戳
    this._lastTime = timeStamp;

    this._handleTimers(intervalSec);
    // console.log (" elapsedTime = " + elapsedMsec + " diffTime = " + intervalSec);
    // 先更新
    this.update(elapsedMsec, intervalSec);
    // 后渲染
    this.render();
    // 回调
    if (this.frameCallback !== null) {
      this.frameCallback(this);
    }
    // 递归调用，形成周而复始的前进
    requestAnimationFrame((elapsedMsec: number): void => {
      this.step(elapsedMsec);
    });
  }

  // 停止动画循环
  public stop(): void {
    if (this._start) {
      // cancelAnimationFrame函数用于:
      //取消一个先前通过调用window.requestAnimationFrame()方法添加到计划中的动画帧请求
      //alert(this._requestId);
      cancelAnimationFrame(this._requestId);
      //this . _requestId = -1 ; // 将_requestId设置为-1

      // 在start和stop函数中，_lastTime和_startTime都设置为-1
      this._lastTime = -1;
      this._startTime = -1;
      this._start = false;
    }
  }
  // 由于 update 和 render 都是虚方法，需要继承自 Application 的子类根据实际的需求来覆写（override）这两个方法
  // 这是米南向对象三要素的经典体现：
  // 封装：将不变的部分（更新，渲染的流程）封装起来放在基类中，也就是基类固定了整个行为规范
  // 多态：将可变部分以虚函数的方式公开给具体实现者，基类并不知道每个子类要如何更新，也不知道每个子类如何渲染
  //      （如 Canvas2DApplication 子类使用 CanvasRenderingContext2D 来进行各种二维图形的绘制，而 WebGLApplication 子类则使用 WebGLRenderingContext 进行二维或是三维图形绘制），让具体的子类实现具体的行为，运行时动态绑定到实际调用的类的成员方法上
  // 继承：很明显，虚函数多态机制依赖于集成，没有继承，就没有多态

  //虚方法，子类能覆写（override），用于更新
  //注意: 第二个参数是秒为单位，第一参数是毫秒为单位
  public update(elapsedMsec: number, intervalSec: number): void {}

  //虚方法，子类能覆写（override），用于渲染
  public render(): void {}

  // 虚函数，子类覆写（overide），用于同步各种资源后启动Application
  public async run(): Promise<void> {
    // 调用start方法，该方法会启动requestAnimationFrame
    // 然后不停的进行回调
    this.start();
  }

  // 根据事件的类型，调用dispatchXXXX虚方法进行事件分发
  // handleEvent是接口EventListenerObject定义的协议分发，必须要实现
  // 事件分发 用于鼠标事件的分发
  public handleEvent(evt: Event): void {
    switch (evt.type) {
      case "mousedown":
        this._isMouseDown = true;
        this.onMouseDown(
          this._toCanvasMouseEvent(evt, EInputEventType.MOUSEDOWN)
        );
        break;
      case "mouseup":
        this._isMouseDown = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseMoveX = 0;
        this.mouseMoveY = 0;
        this.onMouseUp(this._toCanvasMouseEvent(evt, EInputEventType.MOUSEUP));
        break;
      case "mousemove":
        // 如果isSupportMouseMove为true，才会每次鼠标移动触发mouseMove事件
        if (this.isSupportMouseMove) {
          this.onMouseMove(
            this._toCanvasMouseEvent(evt, EInputEventType.MOUSEMOVE)
          );
        }
        // 同时，如果当前鼠标任意一个键处于按下状态并拖动时，触发drag事件
        if (this._isMouseDown) {
          this.onMouseDrag(
            this._toCanvasMouseEvent(evt, EInputEventType.MOUSEDRAG)
          );
        }
        break;
      case "mousewheel":
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseMoveX = 0;
        this.mouseMoveY = 0;
        this.onMouseWheel(
          this._toCanvasMouseEvent(evt, EInputEventType.MOUSEWHEEL)
        );
        break;
      case "keypress":
        this.onKeyPress(
          this._toCanvasKeyBoardEvent(evt, EInputEventType.KEYPRESS)
        );
        break;
      case "keydown":
        this.onKeyDown(
          this._toCanvasKeyBoardEvent(evt, EInputEventType.KEYDOWN)
        );
        break;
      case "keyup":
        this.onKeyUp(this._toCanvasKeyBoardEvent(evt, EInputEventType.KEYUP));
        break;
      default:
        console.log("当前鼠标事件", evt.type);
        break;
    }
  }

  protected onMouseDown(evt: CanvasMouseEvent): void {
    return;
  }

  protected onMouseUp(evt: CanvasMouseEvent): void {
    return;
  }

  protected onMouseMove(evt: CanvasMouseEvent): void {
    return;
  }

  protected onMouseDrag(evt: CanvasMouseEvent): void {
    return;
  }

  protected onKeyDown(evt: CanvasKeyBoardEvent): void {
    return;
  }

  protected onKeyUp(evt: CanvasKeyBoardEvent): void {
    return;
  }

  protected onKeyPress(evt: CanvasKeyBoardEvent): void {
    return;
  }
  protected onMouseWheel(evt: CanvasMouseEvent): void {
    return;
  }

  protected getMouseCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // 将鼠标事件发生时鼠标指针的位置变换为相对当前canvas元素的偏移表示
  // 这是一个受保护方法，意味着只能在本类或其子类中使用,其他类都无法调用本方法
  // 之所以设计为受保护的方法，是为了让子类能够覆写（override）本方法
  // 本方法实现时不考虑 CSS 盒模型对鼠标坐标系变换的影响，如果要支持更完善的变换则可以让子类覆写（override）本方法
  // 只要是鼠标事件（down / up / move / drag .....）都需要调用本方法
  // 将相对于浏览器viewport表示的点变换到相对于canvas表示的点
  protected viewportToCanvasCoordinate(evt: MouseEvent): vec2 {
    // 切记，很重要一点：
    // getBoundingClientRect方法返回的DOMRect
    let rect: DOMRect = this.getMouseCanvas().getBoundingClientRect();

    // 获取触发鼠标事件的target元素，这里总是HTMLCanvasElement
    if (evt.target) {
      let x: number = evt.clientX - rect.left;
      let y: number = 0;
      y = evt.clientY - rect.top; // 相对于canvas左上的偏移
      if (this.isFlipYCoord) {
        y = this.getMouseCanvas().height - y;
      }
      // 变成矢量表示
      let pos: vec2 = new vec2([x, y]);
      return pos;
    }

    alert("evt . target为null");
    throw new Error("evt . target为null");
  }

  private mouseDownX: number = 0;
  private mouseDownY: number = 0;
  private mouseMoveX: number = 0;
  private mouseMoveY: number = 0;
  // 将DOM Event对象信息转换为我们自己定义的CanvasMouseEvent事件
  private _toCanvasMouseEvent(
    evt: Event,
    type: EInputEventType
  ): CanvasMouseEvent {
    // 向下转型，将Event转换为MouseEvent
    let event: MouseEvent = evt as MouseEvent;
    if (type === EInputEventType.MOUSEDOWN) {
      if (event.button === 2) {
        this._isRightMouseDown = true;
      } else if (event.button === 0) {
        // 左键点击
        this.mouseDownX = event.clientX;
        this.mouseDownY = event.clientY;
        console.log("当前点击点X：", this.mouseDownX);
        console.log("当前点击Y：", this.mouseDownY);
      } else if (event.button === 1) {
        // 中键点击
        console.log("中间点击");
      }
    } else if (type === EInputEventType.MOUSEUP && event.button === 2) {
      this._isRightMouseDown = false;
    }
    // 0:左键，2：右键， 1：鼠标中键
    let buttonNum: number = event.button;

    if (type === EInputEventType.MOUSEDRAG) {
      this.mouseMoveX = event.clientX - this.mouseDownX;
      this.mouseMoveY = event.clientY - this.mouseDownY;
    }

    // 将客户区的鼠标pos变换到Canvas坐标系中表示
    let mousePosition: vec2 = this.viewportToCanvasCoordinate(event);
    // 将Event一些要用到的信息传递给CanvasMouseEvent并返回
    let canvasMouseEvent: CanvasMouseEvent = new CanvasMouseEvent(
      event,
      type,
      mousePosition,
      buttonNum,
      this.mouseMoveX,
      this.mouseMoveY,
      event.altKey,
      event.ctrlKey,
      event.shiftKey
    );
    return canvasMouseEvent;
  }

  // 将DOM Event对象信息转换为我们自己定义的Keyboard事件
  private _toCanvasKeyBoardEvent(
    evt: Event,
    type: EInputEventType
  ): CanvasKeyBoardEvent {
    let event: KeyboardEvent = evt as KeyboardEvent;
    // 将Event一些要用到的信息传递给CanvasKeyBoardEvent并返回
    let canvasKeyboardEvent: CanvasKeyBoardEvent = new CanvasKeyBoardEvent(
      type,
      event.key,
      event.repeat,
      event.altKey,
      event.ctrlKey,
      event.shiftKey
    );
    return canvasKeyboardEvent;
  }

  // Timer 容器管理使用的策略是初始化容器为空，按需增加新的 Timer，重用原来的 Timer，做到只增不减，重复使用，以达到设计目标的第 4 条要求：尽量让内存使用与运行效率达到相对平衡

  // 初始化时，timers是空列表
  // 为了减少内存析构，我们在removeTimer时，并不从timers中删除掉timer，而是设置enabled为false
  // 这样让内存使用量和析构达到相对平衡状态
  // 每次添加一个计时器时，先查看timers列表中是否有没有时候用的timer，有的话，返回该timer的id号
  // 如果没有可用的timer，就重新new一个timer，并设置其id号以及其他属性
  public addTimer(
    callback: TimerCallback,
    timeout: number = 1.0,
    onlyOnce: boolean = false,
    data: any = undefined
  ): number {
    let timer: Timer;
    let found: boolean = false;
    for (let i = 0; i < this.timers.length; i++) {
      let timer: Timer = this.timers[i];
      if (timer.enabled === false) {
        timer.callback = callback;
        timer.callbackData = data;
        timer.timeout = timeout;
        timer.countdown = timeout;
        timer.enabled = true;
        timer.onlyOnce = onlyOnce;
        return timer.id;
      }
    }

    // 不存在，就新创建一个Timer对象
    timer = new Timer(callback);
    timer.callbackData = data;
    timer.timeout = timeout;
    timer.countdown = timeout;
    timer.enabled = true;
    timer.id = ++this._timeId; // 由于初始化时id为-1,所以前++
    timer.onlyOnce = onlyOnce; //设置是否是一次回调还是重复回调
    // 添加到timers列表中去
    this.timers.push(timer);
    // 返回新添加的timer的id号
    return timer.id;
  }

  // 根据id在timers列表中查找
  // 如果找到，则设置timer的enabled为false，并返回true
  // 如没找到，返回false
  public removeTimer(id: number): boolean {
    let found: boolean = false;
    for (let i = 0; i < this.timers.length; i++) {
      if (this.timers[i].id === id) {
        let timer: Timer = this.timers[i];
        timer.enabled = false; // 只是enabled设置为false，并没有从数组中删除掉
        found = true;
        break;
      }
    }
    return found;
  }

  // 通过 _handleTimers 来实现触发多个定时任务的操作
  // _handleTimers私有方法被Application的update函数调用
  // update函数第二个参数是以秒表示的前后帧时间差
  // 正符合_handleTimers参数要求
  // 我们的计时器依赖于requestAnimationFrame回调
  // 如果当前Application没有调用start的话
  // 则计时器不会生效
  // _handleTimers 则实现了：
  // 1、Application 能够同时触发多个定时器
  // 2、每个定时器可以以不同帧率来重复执行任务
  // 3、每个定时器可以倒计时方式执行一次任务
  private _handleTimers(intervalSec: number): void {
    // 遍历整个timers列表
    for (let i = 0; i < this.timers.length; i++) {
      let timer: Timer = this.timers[i];

      // 如果当前timer enabled为false，那么继续循环
      if (timer.enabled === false) {
        continue;
      }

      // countdown初始化时 = timeout
      // 每次调用本函数，会减少上下帧的时间间隔
      // 从而形成倒计时的效果
      timer.countdown -= intervalSec;

      // 如果countdown 小于 0.0，那么说明时间到了
      // 要触发回调了
      // 从这里看到，实际上timer并不是很精确的
      // 举个例子，假设我们update每次0.16秒
      // 我们的timer设置0.3秒回调一次
      // 那么实际上是 ( 0.3 - 0.32 ) < 0 ,触发回调
      if (timer.countdown < 0.0) {
        // 调用回调函数
        timer.callback(timer.id, timer.callbackData);

        // 如果该计时器需要重复触发
        if (timer.onlyOnce === false) {
          // 我们重新将countdown设置为timeout
          // 由此可见，timeout不会更改，它规定了触发的时间间隔
          // 每次更新的是countdown倒计时器
          timer.countdown = timer.timeout; //很精妙的一个技巧
        } else {
          // 如果该计时器只需要触发一次，那么我们就删除掉该计时器
          this.removeTimer(timer.id);
        }
      }
    }
  }
}
