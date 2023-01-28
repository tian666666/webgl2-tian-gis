/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-28 22:00:20
 * @LastEditTime: 2023-01-28 22:01:19
 * @LastEditors: tianyw
 */
import { AdapterBase } from "./AdapterBase";

export class Stack<T> extends AdapterBase<T> {
  public remove(): T | undefined {
    if (this._arr.length > 0) {
      return this._arr.pop();
    } else {
      return undefined;
    }
  }
}
