/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-25 15:40:52
 * @LastEditTime: 2023-01-25 16:17:37
 * @LastEditors: tianyw
 */
function run() {
  const divEl = document.getElementById("test2") as HTMLElement;

  const childDivEl = document.createElement("div");
  childDivEl.innerHTML = "I am Test2";

  divEl.appendChild(childDivEl);
}
run();
