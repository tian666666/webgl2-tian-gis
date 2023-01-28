/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-28 21:44:54
 * @LastEditTime: 2023-01-28 21:54:19
 * @LastEditors: tianyw
 */
import { IAdapter } from "./IAdapter";
import { LinkList } from "./LinkList";

// AdapterBase 抽象基类做了 3 件事
// 1、实现了队列和栈共同具有的操作
// 2、将不同的操作以抽象方法的方式留给具体实现者
// 3、在构造函数中根据布尔变量来决定是使用 LinkList 还是用 JS/TS Array
export abstract class AdapterBase<T> implements IAdapter<T> {
    // 内部封装了 JS/TS 内置的 Array 对象或我们自行实现的 List 双向循环链表对象
    protected _arr: Array<T> | LinkList<T>;

    // 构造函数 参数 useList 用来指明我们是用链表还是用 TS/JS Array 来实现底部增删操作
    public constructor(useLinkList: boolean = true) {
        if(useLinkList === true) {
            this._arr = new LinkList<T>(); // 使用链表对象
        }else{
            this._arr = new Array<T>(); // 使用 JS/TS Array 对象
        }
       
    }
    // 在容器的尾部添加一个元素
    public add(t: T): void {
        this._arr.push(t);
    }
    // 抽象方法 这是因为队列和栈具有不同的操作方法
    // 子类需要自行实现正确的方法
    public abstract remove(): T | undefined;

    // 当前队列或栈的元素个数
    public get length(): number {
        return this._arr.length;
    }
    // 判断队列或栈是否为空
    public get isEmpty(): boolean {
        return this._arr.length <= 0;
    }
    // 清空队列或栈
    public clear(): void {

        // 简单起见，直接重新创建一个新的底层容器对象
        // 需要使用 instanceof 判断类型
        if(this._arr instanceof LinkList) {
            this._arr = new LinkList<T>(); 
        }else{
            this._arr = new Array<T>();
        }
        
    }

    // public toString(): string {
    //     return this._arr.toString();
    // }
}