/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-01-28 22:06:48
 * @LastEditors: tianyw
 */
import { Queue } from "../../src/dataStructures/Queue";
import { Stack } from "../../src/dataStructures/Stack";
function run() {
  let que: Queue<string> = new Queue();
  que.add("a1");
  que.add("b1");
  que.add("c1");
  console.log(que);
  const out1 = que.remove();
  console.log(out1);
  console.log("-----------------------------------");
  let sta: Stack<string> = new Stack();
  sta.add("a2");
  sta.add("b2");
  sta.add("c2");

  console.log(sta);
  const out2 = sta.remove();
  console.log(out2);
}
run();
