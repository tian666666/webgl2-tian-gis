/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-01-27 14:22:41
 * @LastEditors: tianyw
 */
import { Dictionary } from "../../src/dataStructures/Dictionary";
function run() {
  let dict: Dictionary<string> = new Dictionary(false);
  dict.insert("a", "a");
  dict.insert("d", "d");
  dict.insert("c", "c");
  dict.insert("b", "b");

  console.log(JSON.stringify(dict));

  dict.remove("c");

  console.log(JSON.stringify(dict));

  console.log(dict.contains("c"));
  console.log(dict.find("b"));
  console.log(JSON.stringify(dict.keys));
  console.log(JSON.stringify(dict.values));
}
run();
