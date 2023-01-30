/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-29 22:20:43
 * @LastEditTime: 2023-01-29 22:48:30
 * @LastEditors: tianyw
 */
// 先根/前序枚举器

import { IAdapter } from "./IAdapter";
import { IEnumerator } from "./IEnumerator";
import { Indexer } from "./Indexer";
import { TreeNode } from "./TreeNode";

export class NodeT2BEnumerator<
  T,
  IdxFunc extends Indexer,
  Adapter extends IAdapter<TreeNode<T>>
> implements IEnumerator<TreeNode<T>>
{
  private _node: TreeNode<T> | undefined; // 头节点，指向输入的根节点
  private _adapter!: IAdapter<TreeNode<T>>; // 枚举器内部持有一个队列或堆栈的适配器，用于存储遍历的元素，指向泛型参数
  // 这里 ! 和 ？是相对的： 如 private a1?: string; 则说明 a1 可能是 undefined、null（没有值） ；而 private a1!:string，表示 a1 一定有值
  private _currNode!: TreeNode<T> | undefined; // 当前正在操作的节点类型
  private _indexer!: IdxFunc; // 当前的 Indexer，用于从左到右还是从右到左遍历，指向泛型参数

  public constructor(
    node: TreeNode<T> | undefined,
    func: IdxFunc,
    adapter: new () => Adapter
  ) {
    // 必须要有根节点 否则无法遍历
    if (node === undefined) {
      return;
    }
    this._node = node; // 头节点，指向输入的根节点
    this._indexer = func; // 设置回调函数
    this._adapter = new adapter(); // 调用 new 回调函数
    this._adapter.add(this._node); // 初始化时将根节点放入到堆栈或队列中
    this._currNode = undefined; // 设定当前 node 为 undefined
  }

  public reset(): void {
    if (this._node === undefined) {
      return;
    }
    this._currNode = undefined;
    this._adapter.clear();
    this._adapter.add(this._node);
  }

  public moveNext(): boolean {
    // 当队列或栈中没有任何元素时，说明遍历已经全部完成了，返回 false
    if (this._adapter.isEmpty) {
      return false;
    }
    // 弹出头部或尾部元素，依赖于 adapter 是 stack 还是 queue
    this._currNode = this._adapter.remove();

    // 如果当前的节点不为 undefined
    if (this._currNode !== undefined) {
      // 获取当前节点的儿子个数
      let len: number = this._currNode.childCount;
      // 遍历所有的儿子
      for (let i = 0; i < len; i++) {
        // 儿子是从左到右，还是从右到左进入队列或堆栈
        // 注意，_indexer 是在这里调用的
        let childIdx: number = this._indexer(len, i);

        let child: TreeNode<T> | undefined =
          this._currNode.getChildAt(childIdx);
        if (child !== undefined) {
          this._adapter.add(child);
        }
      }
    }
    return true;
  }

  public get current(): TreeNode<T> | undefined {
    return this._currNode;
  }
}
