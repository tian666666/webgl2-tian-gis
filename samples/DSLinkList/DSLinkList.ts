/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-01-27 23:08:17
 * @LastEditors: tianyw
 */
import { LinkList } from "../../src/dataStructures/LinkList";
function run() {
  let list: LinkList<number> = new LinkList();
  list.push(100);
  list.push(200);
  list.push(300);
  list.push(400);
  console.log(list);
  let list2: LinkList<string> = new LinkList();
  list2.push("a");
  list2.push("b");
  list2.push("c");
  list2.push("d");
  console.log(list2);
}
run();
