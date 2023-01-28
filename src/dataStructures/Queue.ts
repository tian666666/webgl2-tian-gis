/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-28 21:54:30
 * @LastEditTime: 2023-01-28 22:00:11
 * @LastEditors: tianyw
 */
import { AdapterBase } from "./AdapterBase";

export class Queue<T> extends AdapterBase<T> {
  public remove(): T | undefined {
    if (this._arr.length > 0) {
      // LinkList 和 Array 对于顶部删除具有相同名称的方法 无需额外判断
      return this._arr.shift();
    } else {
      return undefined;
    }
  }
}
