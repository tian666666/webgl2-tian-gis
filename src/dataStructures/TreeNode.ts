/*
                                  树数据结构
            -------------------------root--------------------
           /                         |                      \
        node1                       node2                  node3
      /   |                       /      \                  |
 node4  node5                   node6   node7              node8
    |                            |         |
  node9                        node10  node11
                                           |
                                         node12
    */

import { Indexer, IndexerL2R } from "./Indexer";
import { NodeCallback } from "./NodeCallback";

// 要实现如上所示的树结构，一般需要使用在内存中方便寻址到父节点和儿子节点的存储方式
export class TreeNode<T> {
  // 父子节点的存储方式
  private _parent: TreeNode<T> | undefined; // 指向当前节点的父节点，如果 this 是根节点，则指向 undefined，因为根节点肯定没有父节点

  private _children: Array<TreeNode<T>> | undefined; // 数组中保存所有的直接儿子节点，如果是叶子节点，则 _children 为 undefined 或 _children.length = 0

  public name: string; // 当前节点的名称，有利于 debug 时信息输出或按名字获取节点（集合）操作

  public data: T | undefined; // 一个 泛型对象， 指向一个需要依附到当前节点的对象

  // 树节点的构造函数
  public constructor(
    data: T | undefined = undefined,
    parent: TreeNode<T> | undefined = undefined,
    name: string = ""
  ) {
    this._parent = parent;
    this._children = undefined;
    this.name = name;
    this.data = data;
    // 如果有父节点，则将 this 节点添加到父节点的子节点列表中
    if (this._parent !== undefined) {
      this._parent.addChild(this);
    }
  }

  // 树节点添加节点的三种情况及操作（当要向树节点中添加子节点时）：
/*
                                  树数据结构
            -------------------------root--------------------
           /                         |                      \
        node1                       node2                  node3
      /   |                       /      \                  |
 node4  node5                   node6   node7              node8
    |                            |         |
  node9                        node10  node11
                                           |
                                         node12
    */
  // 1、首先要判断要添加的儿子节点如果是当前节点的父节点或祖先节点，则什么都不处理，直接退出操作
  //  （如 向 node4 节点下添加一个子节点（node1）,因为此时 node1 是 node4 的父节点，则不允许这种操作,这样会导致循环引用，程序崩溃）
  // 2、然后判断要添加的儿子节点是否有父节点，如果有父节点，则需要先将儿子节点从父亲节点中移除，再添加到当前节点
  //  (如 向 node4 节点 添加一个 node11 节点，由于 node11 节点的父节点是 node7，则应该先从 node7 节点移除其子节点 node11，再将 node11 添加为 node4 的子节点)
  // 3、最后如果要添加的子节点是新创建的节点，没有父节点，也不会有循环引用，则使用标准方式处理
  //  (如新建了一个 node14 节点，则 node14 节点可以直接添加为 node4 的子节点)

  // 要实现上述子节点添加算法，需要先实现必要的辅助方法

  // 判断一个要添加的子节点是否是当前节点的祖先节点
  public isDescendantOf(ancestor: TreeNode<T> | undefined): boolean {
    // undefined 值检查
    if (ancestor === undefined) {
      return false;
    }
    // 从当前节点的父节点开始向上遍历
    for (
      let node: TreeNode<T> | undefined = this._parent;
      node !== undefined;
      node = node._parent
    ) {
      // 逐级向上遍历祖先节点，直至祖先节点为 undefined，即遍历到根节点
      // 如果当前节点的祖先等于 ancestor，则说明当前节点时 ancestor 的子孙，即 ancestor 是当前节点的祖先节点，否则返回 false
      if (node === ancestor) {
        return true;
      }
    }
    return false;
  }

  // 移除某个节点:根据索引
  public removeChildAt(index: number): TreeNode<T> | undefined {
    // 由于使用延迟初始化，必须要进行 undefined 检查
    if (this._children === undefined) {
      return undefined;
    }
    // 根据索引从 _children 数组中获取节点
    let child: TreeNode<T> | undefined = this.getChildAt(index); // 索引可能会越界，这是 getChildAt 函数处理的，如果索引越界了，getChildAt 函数返回 undefined
    if (child === undefined) {
      return undefined;
    }
    this._children.splice(index, 1); // 从子节点列表中移除掉
    child._parent = undefined; // 将子节点的父节点设置为 undefined
    return child;
  }
  // 移除某个节点：依据节点引用本身
  public removeChild(child: TreeNode<T> | undefined): TreeNode<T> | undefined {
    // 参数为 undefined 的处理
    if (child === undefined) {
      return undefined;
    }
    // 如果当前节点是叶子节点的处理
    if (this._children === undefined) {
      return undefined;
    }
    // 由于使用数组线性存储方式，从索引查找元素是最快的
    // 但是从元素查找索引，必须遍历整个数组
    let index: number = -1;
    for (let i = 0; i < this._children.length; i++) {
      if (this.getChildAt(i) === child) {
        index = i; // 找到要删除的子节点 记录索引
        break;
      }
    }
    // 没有找到索引
    if (index === -1) {
      return undefined;
    }
    // 找到要移除的子节点的索引，调用 removeChildAt 方法即可
    return this.removeChildAt(index);
  }
  // 移除某个节点：将 this 节点从父节点删除
  public remove(): TreeNode<T> | undefined {
    if (this._parent !== undefined) {
      return this._parent.removeChild(this);
    }
    return undefined;
  }

  // 实现 addChild 等方法
  // 有了 isDescendantOf 方法和 remove 相关方法，就能实现添加子节点的方法
  public addChildAt(
    child: TreeNode<T>,
    index: number
  ): TreeNode<T> | undefined {
    // 第一种情况：要添加的子节点是当前节点的祖先的判断，换句话说就是当前节点已经是 child 节点的子孙节点，这样会循环引用，那就直接退出
    if (this.isDescendantOf(child)) {
      return undefined;
    }
    // 延迟初始化的处理
    if (this._children === undefined) {
      // 有两种方式初始化数组，这里用了 []
      this._children = [];
      // this._children = new Array<TreeNode<T>>();
    }
    // 索引越界检查
    if (index >= 0 && index <= this._children.length) {
      if (child._parent !== undefined) {
        // 第二种情况：要添加的节点是有父节点的，需要从父节点中移除
        child._parent.removeChild(child);
      }
      // 第三种情况：要添加的节点不是当前节点的祖先并且也没有父节点（新节点或已从父节点移除）
      // 设置父节点并添加到 _children 中
      child._parent = this;
      this._children.splice(index, 0, child); // 向指定位置插入元素
      return child;
    } else {
      return undefined;
    }
  }

  public addChild(child: TreeNode<T>): TreeNode<T> | undefined {
    if (this._children === undefined) {
      this._children = [];
    }
    // 在列表最后添加一个节点
    return this.addChildAt(child, this._children.length);
  }

  // 通过以上就实现了树结构的两个重要操作：即树节点的添加和移除操作，这样就能使用编程方式生成一颗节点树，也能删除某个节点，甚至整棵节点树
  // 而通过 parent/getChild/depth 等以下只读属性或方法，就能查询树节点的各种层次关系，能唯一改变树节点层次关系的操作只能是 addChild 和 removeChild 系列方法
  // 获取当前节点的父节点和子节点的相关信息和操作
  public get parent(): TreeNode<T> | undefined {
    return this._parent;
  }

  // 从当前节点中获取索引指向的子节点
  public getChildAt(index: number): TreeNode<T> | undefined {
    if (this._children === undefined) {
      return undefined;
    }
    if (index < 0 || index >= this._children.length) {
      return undefined;
    }
    return this._children[index];
  }
  // 获取当前节点的子节点个数
  public get childCount(): number {
    if (this._children !== undefined) {
      return this._children.length;
    } else {
      return 0;
    }
  }

  // 判断当前节点是否有子节点
  public hasChild(): boolean {
    return this._children !== undefined && this._children.length > 0;
  }

  // 从当前节点获取根节点及获取当前节点的深度
  public get root(): TreeNode<T> | undefined {
    let curr: TreeNode<T> | undefined = this;
    // 从 this 开始，一直向上遍历
    while (curr !== undefined && curr.parent !== undefined) {
      curr = curr.parent;
    }
    // 返回 root 节点
    return curr;
  }
  public get depth(): number {
    let curr: TreeNode<T> | undefined = this;
    let level: number = 0;
    while (curr !== undefined && curr.parent !== undefined) {
      curr = curr.parent;
      level++;
    }
    return level;
  }

  // 规范化输出节点名称（节点名称结合节点深度，深度越深，打印在控制台的节点名称前空格越多，用来在控制台用树结构的方式打印出来相对可视化的树结构）
  public repeatString(n: number, target: string = " ") {
    let total: string = "";
    for (let i = 0; i < n; i++) {
      total += target;
    }
    return total;
  }

  // 以深度优先的方式递归遍历其子孙方法
  public visit(
    preOrderFunc: NodeCallback<T> | null = null,
    postOrderFunc: NodeCallback<T> | null = null,
    indexFunc: Indexer = IndexerL2R
  ): void {
    // 在 子节点递归调用 visit 之前，触发先根（前序）回调
    // 注意前序回调的时间点在此处
    if (preOrderFunc !== null) {
      preOrderFunc(this);
    }
    // 遍历所有子节点
    let arr: Array<TreeNode<T>> | undefined = this._children;
    if (arr !== undefined) {
      for (let i = 0; i < arr.length; i++) {
        // 根据 indexFunc 选取左右遍历还是右左遍历
        let child: TreeNode<T> | undefined = this.getChildAt(
          indexFunc(arr.length, i)
        );
        if (child !== undefined) {
          // 递归调用 visit
          child.visit(preOrderFunc, postOrderFunc, indexFunc);
        }
      }
    }
    // 在这个时机触发 postOrderFunc 回调
    // 注意后根（后序）回调的时间点在此处
    if (postOrderFunc !== null) {
      postOrderFunc(this);
    }
  }
}
