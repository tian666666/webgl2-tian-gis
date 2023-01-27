/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-27 11:03:44
 * @LastEditTime: 2023-01-27 14:16:52
 * @LastEditors: tianyw
 */
export class Dictionary<T> {
  // 内部封装了索引签名或 ES6 Map 对象，其键的数据类型为 string，泛型参数可以是任意类型
  // 强制键的类型必须为 string 类型
  private _items: { [k: string]: T } | Map<string, T>;
  // 用来跟踪目前的元素个数，在成功调用 insert 方法后递增，在 remove 方法后递减
  private _count: number = 0;

  // 默认使用 ES6 Map 对象来管理相关数据
  // 构造函数 根据参数 uesES6Map 决定内部使用哪个关联数组
  public constructor(useES6Map: boolean = true) {
    if (useES6Map === true) {
      this._items = new Map<string, T>();
    } else {
      // 如果不使用 Map，则选择使用索引签名类型来管理相关数据
      this._items = {}; // 初始化索引签名
    }
  }
  // 只读属性：获取字典的元素个数
  public get length(): number {
    return this._count;
  }
  // 判断某个键是否存在
  public contains(key: string): boolean {
    if (this._items instanceof Map) {
      return this._items.has(key);
    } else {
      return this._items[key] !== undefined;
    }
  }
  // 给定一个键，返回对应的值对象
  public find(key: string): T | undefined {
    if (this._items instanceof Map) {
      return this._items.get(key);
    } else {
      return this._items[key];
    }
  }
  // 插入一个键值对
  public insert(key: string, value: T): void {
    if (this._items instanceof Map) {
      this._items.set(key, value);
    } else {
      this._items[key] = value;
    }
    this._count++;
  }
  // 删除
  public remove(key: string): boolean {
    let ret: T | undefined = this.find(key);
    if (ret === undefined) {
      return false;
    }
    if (this._items instanceof Map) {
      this._items.delete(key);
    } else {
      delete this._items[key];
    }
    this._count--;
    return true;
  }
  // 获取所有键
  public get keys(): string[] {
    let keys: string[] = [];
    if (this._items instanceof Map) {
      let keyArray = this._items.keys();
      // 返回的是 IterableIterator<T> 类型，该类型能别用于 for...of... 语句，由于设计的 Dictionary 对象的 keys 属性返回的是数组对象 因此需要再次包装一下
      for (let key of keyArray) {
        keys.push(key);
      }
    } else {
      for (let prop in this._items) {
        if (this._items.hasOwnProperty(prop)) {
          keys.push(prop);
        }
      }
    }
    return keys;
  }
  // 获取所有值
  public get values(): T[] {
    let values: T[] = [];
    if (this._items instanceof Map) {
      // 一定要用of，否则出错
      // 返回的是 IterableIterator<T> 类型，该类型能别用于 for...of... 语句，由于设计的 Dictionary 对象的 values 属性返回的是数组对象 因此需要再次包装一下
      let vArray = this._items.values();
      for (let value of vArray) {
        values.push(value);
      }
    } else {
      for (let prop in this._items) {
        if (this._items.hasOwnProperty(prop)) {
          values.push(this._items[prop]);
        }
      }
    }
    return values;
  }
}
