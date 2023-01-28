/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-28 21:44:18
 * @LastEditTime: 2023-01-28 21:44:41
 * @LastEditors: tianyw
 */
export interface IAdapter<T> {
  add(t: T): void; // 将t入队列或堆栈
  remove(): T | undefined; // 弹出队列或堆栈顶部的元素
  clear(): void; // 清空队列或堆栈，用于重用

  //属性
  length: number; // 当前队列或堆栈的元素个数
  isEmpty: boolean; // 判断当前队列或堆栈是否为空
}
