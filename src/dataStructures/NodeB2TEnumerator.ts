/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-29 22:48:42
 * @LastEditTime: 2023-01-29 22:58:53
 * @LastEditors: tianyw
 */
// 后根/后序枚举器

import { IEnumerator } from "./IEnumerator";
import { TreeNode } from "./TreeNode";

// 后根/后序枚举器

export class NodeB2TEnumerator<T> implements IEnumerator<TreeNode<T>> {
  private _iter: IEnumerator<TreeNode<T>>; // 持有一个枚举器接口
  private _arr!: Array<TreeNode<T> | undefined>; // 声明一个数组对象
  private _arrIdx!: number; // 当前数组索引

  public constructor(iter: IEnumerator<TreeNode<T>>) {
    this._iter = iter; // 指向先根迭代器
    this.reset(); // 调用  reset，填充数组内容及 _arrIdx
  }
  public reset(): void {
    this._arr = []; // 清空数组
    // 调用先根枚举器，将结果全部存入数组
    while (this._iter.moveNext()) {
      this._arr.push(this._iter.current);
    }
    // 设置 _arrIdx 为数组的 length
    // 因为后根遍历是先根遍历的逆操作，所以是从数组尾部向顶部的遍历
    this._arrIdx = this._arr.length;
  }
  public get current(): TreeNode<T> | undefined {
    // 数组越界检查
    if (this._arrIdx >= this._arr.length) {
      return undefined;
    } else {
      // 从数组中获取当前节点
      return this._arr[this._arrIdx];
    }
  }
  public moveNext(): boolean {
    this._arrIdx--;
    return this._arrIdx >= 0 && this._arrIdx < this._arr.length;
  }
}
