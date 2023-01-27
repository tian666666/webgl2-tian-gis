export class LinkNode<T> {
  public next: LinkNode<T> | null; // 指向下一个节点，自引用，指向当前 ListNode 的后驱
  public prev: LinkNode<T> | null; // 指向前一个节点，自引用，指向当前 ListNode 的前驱
  public data: T | undefined; // 当前节点实际存储的数据，ListNode 所持有的数据

  public constructor(data: T | undefined = undefined) {
    // 初始化时 当前 ListNode 的前驱和后驱都设置为 null
    this.next = this.prev = null; // next 、prev 指向的是当前整个节点 而不是当前整个节点（一个 LinkNode）的 prev 或 next
    this.data = data;
  }
}

// 该结构表示一个双向循环链表，它包含了一个 ListNode<T> 的头节点（哨兵节点），该头节点（_header）在链表初始化时，其 next 和 prev 成员变量都指向自身(_header)
// 头节点和最后一个节点：头节点 _header 的前驱指针 prev 指向最后一个节点（尾节点），而最后一个节点（尾节点）的后驱指针 next 指向头节点 _header
// 从而首尾相连，形成一个闭环
export class LinkList<T> {
  private _header: LinkNode<T>; // 记录头节点 用头节点作为双向循环节点的开始（如从头节点开始进行数据的录入、删除等）
  private _length: number;

  public constructor() {
    this._header = new LinkNode<T>();
    this._header.next = this._header; // 初始化时 头节点指向自身
    this._header.prev = this._header; // 初始化时 头节点指向自身
    this._length = 0; // 初始化时元素个数为 0 ，头节点作为哨兵节点不计算在内
  }
  // 获取 List 元素个数
  public get length(): number {
    // 如果当前 List 的 length 为 0，则说明是个空链表
    return this._length;
  }

  // 判断是否为空链表（当 this._length = 0 时 也可判断为空链表）
  public empty(): boolean {
    // 当头节点的后驱指针 next 指针指向头节点本身，说明是空链表
    return this._header.next === this._header;
  }

  // 在第一个参数 node 前插入一个节点 数据插入操作（在某个节点之前，插入一个节点）
  // 实现步骤为：
  // 1、在 参考节点前先插入一个节点即插入一个新节点
  // 2、将新节点的后驱指向参考节点
  // 3、将新节点的前驱指向参考节点原来的前驱   此时新节点的前驱、后驱指向就明确了
  // 4、修改 参考节点的前驱，使 参考节点的前驱指向新节点，此时参考节点的前驱、后驱指向也就明确了
  // 5、修改插入之前，参考节点的前驱指向的节点（上一个节点）的后驱需要修改为指向新插入的节点
  // 6、至此，新插入的节点的前后两个节点（参考节点的上一个节点，参考节点），这三个节点的前驱、后驱指向就都明确了
  private insertBefore(node: LinkNode<T>, data: T | undefined): LinkNode<T> {
    // 新建一个要插入的新节点
    let ret: LinkNode<T> = new LinkNode<T>(data);
    // 设置新节点的后驱指针和前驱指针
    ret.next = node; // 新节点的后驱即为当前参考节点
    ret.prev = node.prev; // 新节点的前驱 即为 当前参考节点原来的前驱

    // 设置好新节点的前后驱指针后
    // 还要调整 参考节点 的前后驱指针

    // 将当前参考节点的前一个节点的 后驱改为指向新节点
    if (node.prev !== null) {
      node.prev.next = ret;
    }
    // 将当前参考节点的前驱指向 新节点
    node.prev = ret;

    // 插入成功后 元素计数加 1
    this._length++;
    // 返回新插入的那个节点
    return ret;
  }

  // 获取尾节点
  public begin(): LinkNode<T> {
    if (this._header.next === null) {
      throw new Error("头节点的 next 指针必须不为 null");
    }
    // 若是链表不为空，则返回第一个节点
    // 若是链表为空， next 指向头节点本身，因此返回头节点
    // 绝对不可能返回 null 值
    return this._header.next;
  }

  // 获取头节点
  public end(): LinkNode<T> {
    return this._header;
  }

  // 查询是否包含某个值
  public contains(data: T): boolean {
    for (
      let link: LinkNode<T> | null = this._header.next;
      link !== null && link !== this._header;
      link = link.next
    ) {
      if (link.data !== undefined) {
        if (link.data === data) {
          return true;
        }
      }
    }
    return false;
  }

  // 双向遍历操作
  public forNext(cb: (data: T) => void): void {
    for (
      let link: LinkNode<T> | null = this._header.next;
      link !== null && link !== this._header;
      link = link.next
    ) {
      if (link.data !== undefined) {
        cb(link.data); // 调用回调函数
      }
    }
  }
  // 双向遍历操作
  public forPrev(cb: (data: T) => void): void {
    for (
      let link: LinkNode<T> | null = this._header.prev;
      link !== null && link !== this._header;
      link = link.prev
    ) {
      if (link.data !== undefined) {
        cb(link.data); // 调用回调函数
      }
    }
  }

  // 删除操作  删除操作是插入操作的逆操作
  public remove(node: LinkNode<T>): void {
    // 获得要删除的 节点 的后驱指针指向的节点
    let next: LinkNode<T> | null = node.next;
    // 获得要删除的 节点 的前驱指针指向的节点
    let prev: LinkNode<T> | null = node.prev;

    if (prev !== null) {
      // 修改 删除节点的上一个节点的 后驱为删除节点的后驱
      prev.next = next;
    }
    if (next !== null) {
      // 修改 删除节点的下一个节点的 前驱为删除节点的前驱
      next.prev = prev;
    }
    this._length--;
  }

  // 通过 insertBefore 和 remove 方法，结合 begin 和 end 以获得头节点和尾节点的功能，可以实现头尾插入、头尾删除的操作
  // 在尾部添加
  public push(data: T): void {
    this.insertBefore(this.end(), data);
  }

  // 在尾部移除
  public pop(): T | undefined {
    let prev: LinkNode<T> | null = this.end().prev;
    if (prev !== null) {
      let ret: T | undefined = prev.data;
      this.remove(prev);
      return ret;
    }
    return undefined;
  }
  // 在头部添加
  public unshift(data: T): void {
    this.insertBefore(this.begin(), data);
  }
  // 在头部移除
  public shift(): T | undefined {
    let ret: T | undefined = this.begin().data;
    this.remove(this.begin());
    return ret;
  }
}
