/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-25 15:40:47
 * @LastEditTime: 2023-01-25 16:07:19
 * @LastEditors: tianyw
 */
import { cprint } from "./c";
function run() {
  const divEl = document.getElementById("test1") as HTMLElement;

  const childDivEl = document.createElement("div");
  childDivEl.innerHTML = "I am Test1";

  divEl.appendChild(childDivEl);
}
run();
cprint();
