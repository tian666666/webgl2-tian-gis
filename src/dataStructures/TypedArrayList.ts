export class TypedArrayList<T extends Uint16Array | Float32Array | Uint8Array> {
  // 内部使用类型数组，类型数组必须是Uint16Array | Float32Array | Uint8Array之一
  private _array: T;

  // 如果需要在ArrayList<T>的构造函数中new一个类型数组，必须要提供该类型数组的构造函数签名
  private _typedArrayConstructor: new (length: number) => T;

  // _length表示当前已经使用过的元素个数，而_capacity是指当前已经预先内存分配好的的元素个数
  private _length: number; // 已使用容量，当前数组已经存入的个数
  private _capacity: number; // 最大容量，当前数组支持存入的个数

  // 提供一个回调函数，当_capacity发生改变时，调用该回调函数，即改变数组容量时回调
  public capacityChangedCallback:
    | ((arrayList: TypedArrayList<T>) => void)
    | null;

  public constructor(
    typedArrayConstructor: new (capacity: number) => T, // 使用方式 new TypedArrayList( Float32Array, 6 * 7 ); 这里使用方式中的 Float32Array 就是用来确定 类型数组必须是Uint16Array | Float32Array | Uint8Array之一
    capacity: number = 8
  ) {
    this._typedArrayConstructor = typedArrayConstructor;

    this._capacity = capacity; // 而预先分配内存的个数为capacity

    // 确保初始化时至少有8个元素的容量
    if (this._capacity <= 0) {
      this._capacity = 8; // 默认分配8个元素内存
    }

    this._array = new this._typedArrayConstructor(this._capacity); // 预先分配capacity个元素的内存，使用时相当于：new Float32Array(10) 创建一个容量/长度为 10 的  类型为 Float32Array 的数组

    this._length = 0; // 初始化时，其_length为0，实际使用的长度(存入的数据的个数)

    this.capacityChangedCallback = null; //默认情况下，回调函数为null
  }

  // 只读属性：获取数组当前实际存入数据个数
  public get length(): number {
    return this._length;
  }
  // 只读属性：获取数组当前最大容量
  public get capacity(): number {
    return this._capacity;
  }
  // 只读属性：获取当前数组的实际类型
  public get typeArray(): T {
    return this._array;
  }

  // TypedArrayList 实现的目的是为了减少内存的重新分配，能够不断被重用，而 clear 方法时能够重用 TypedArrayList 的一个重要操作
  // 最简单高效的处理方式，直接设置_length为0，重用整个类型数组
  // TypedArray 有四个特点：
  // 1. TypedArray 元素都是一个类型的
  // 2. TypedArray 元素是连续的，不会有空位
  // 3. TypedArray 模式元素的初始值都是 0
  // 4. TypedArray 只是一层视图，数据都存储到底层的 ArrayBuffer 中
  // 利用第三个特点，当清除数组时，数组的容量始终为 this._capacity，且每个数组位置上的初始数字都为 0，即数组始终有值
  public clear(): void {
    this._length = 0;
    // 也可以循环调用 remove 方法 清除所有
  }

  // 从数组中删除 index 位置的元素 返回删除的元素
  public remove(idx: number): number {
    if (idx < 0 || idx >= this._length) {
      throw new Error("索引越界！");
    }
    const num = this._array[idx];
    for (let i = idx; i < this.length; i++) {
      this._array[i] = this._array[i + 1];
    }
    // TypedArray 有四个特点：
    // 1. TypedArray 元素都是一个类型的
    // 2. TypedArray 元素是连续的，不会有空位
    // 3. TypedArray 模式元素的初始值都是 0
    // 4. TypedArray 只是一层视图，数据都存储到底层的 ArrayBuffer 中
    // 利用第三个特点，remove 某个位置的元素时，只需要直接移除即可，不需要对最后一个录入的数据进行重新赋值
    // 比如：数组长度为 8，已经录入了三个数字,[0,1,2,0,0,0,0,0],这时删除了下标为 1（此处值也为 1）的数字后，不需要将第三个数，下标为 2（删除前数值也为 2）的值重新设置值
    // 因为元素的初始值都是 0，移除一位之后，后面的会自动补为 0，数组容量的长度始终为 8
    this._length--;
    return num;
  }

  public pushArray(nums: number[]): void {
    for (const num of nums) {
      this.push(num);
    }
  }
  // push 具有动态增加容量的功能 以防止添加的数据个数超过当前实际容量
  public push(num: number): number {
    // 如果当前的length超过了预先分配的内存容量
    // 那就需要进行内存扩容
    if (this._length >= this._capacity) {
      // this._length 是实时增加的，最大也不会超过 this._capacity 因此扩容时  this._capacity 哪怕只时增加一个 也是可以的
      //如果最大容量数>0
      if (this._capacity > 0) {
        //增加当前的最大容量数即进行数组扩容 数组扩容策略可以自行定制 如果 this._capacity 每次都是一个一个增加，会导致频繁进行扩容 这里默认使用的扩容策略为
        // 每次扩容在原来的基础上增加一倍，即原本为 10，下次为 20，再下一次为 40，以此类推
        this._capacity += this._capacity;
      }
      // 用旧数组保存
      let oldArray: T = this._array;
      // 重新初始化/扩容原本数组
      this._array = new this._typedArrayConstructor(this._capacity);
      // 将oldArray中的数据复制到新建的array中
      this._array.set(oldArray);
      // 如果有回调函数，则调用回调函数
      if (this.capacityChangedCallback) {
        this.capacityChangedCallback(this);
      }
    }
    // 当使用了 clear 方法后，this._length 被设置为 0，此时 this._array 可能还是上一次操作后的数组
    // 此时并没有清空 this._array 或重新初始化 this._array，上一次 this._array 被分配的内存空间被重新使用，而不是再次分配新的内存
    // 进而减少了内存的分配
    // 同时数组的数据从 数组下标为 0 的地方进行了数据重新录入（覆盖）
    // 从而实现较少内存的重新分配的同时可以重用上一次的内存空间实现新的数据的录入
    // 这里需要注意一个问题就是：当进行重新复用时 如果新录入的数据只有 10 个，而上次录入的数据可能有 20 个
    // 这时前 10 个肯定被重新录入，即为最新的数据，但后 10 个依然为上次录入的数据
    // 因此 _array 被设计为 私有属性 即无法直接获取 _array
    // 而是需要通过 subArray 或 slice 方法来获取到最大范围为 0 到 this._length 的数组（即当前最新录入数据的所有数组（即获取的是从 0 到 10 的数组，而不是 0 到 20 的数组，虽然 _array 实际上为 20 的数组））
    // 这样就保证了数组从更新、获取、重新复用整个逻辑上都是最新的。
    this._array[this._length] = num;
    return this._length++;
  }
  // 根据数组下标获取指定位置的数据
  public at(idx: number): number {
    if (idx < 0 || idx >= this.length) {
      throw new Error("索引越界！");
    }
    // 都是number类型
    let ret: number = this._array[idx];
    return ret;
  }

  // subArray 和 slice
  // 无需考虑 end 是否大于数组的实际使用数据的个数或容量长度，大于 this.length 时，会自动约束至 this.length
  // 具有以下特性：
  // 1、被 begin 和 end 指定的范围将会收束与当前数组的有效索引
  // 2、若计算后得出的长度是负数，将会被收束成 0
  // 3、若 begin 或 end 是负数，将会被当做成是从数组末端读取的索引
  // 参考： https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray
  // 参考： https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice

  // slice 和 subArray 的最大不同之处在于：

  // 1、ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区。
  //     它是一个字节数组，通常在其他语言中称为“byte array”。
  //     你不能直接操作 ArrayBuffer 的内容，而是要通过 类型数组对象 或 DataView 对象来操作，
  //     它们会将缓冲区中的数据表示为特定的格式，并通过这些格式来读写缓冲区的内容。
  // 2、TypedArray 和 DataView 都是操作 ArrayBuffer 的一种视图，
  //    TypedArray 和 DataView 在操作数据时（增加、删除等）实际上是在操作 ArrayBuffer，
  //     也就是 TypedArray 和 DataView 都有对应的 ArrayBuffer 用来数据的实际存储、更新、删除等。
  // 3、slice 方法在创建新类型数组的同时还会重新创建并复制源类型数组中的 ArrayBuffer 数据
  //    而 subarray 方法不会重新创建并复制，而仅仅是共享了源类型数组的 ArrayBuffer
  // 4、这样带来的就是：由于 slice 共享源数组的 ArrayBuffer，因此 slice 返回的数组如果被修改后，源数组的内容也会被修改，subArray 则不会

  public subArray(start: number = 0, end: number = this.length): T {
    return this._array.subarray(start, end) as T;
  }

  public slice(start: number = 0, end: number = this.length): T {
    return this._array.slice(start, end) as T;
  }
}
