/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-01-27 00:17:33
 * @LastEditors: tianyw
 */
import { TypedArrayList } from "../../src/dataStructures/TypedArrayList";

function run() {
  const nums = new TypedArrayList(Float32Array);
  nums.push(0);
  nums.push(1);
  nums.push(2);
  console.log(nums.slice());
  nums.remove(1);
  console.log(nums.slice());
}
run();
