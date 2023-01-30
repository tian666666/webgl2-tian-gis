/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-01-26 18:49:30
 * @LastEditTime: 2023-01-30 22:52:13
 * @LastEditors: tianyw
 */

import { IEnumerator } from "../../src/dataStructures/IEnumerator";
import { NodeEnumeratorFactory } from "../../src/dataStructures/NodeEnumeratorFactory";
import { TreeNode } from "../../src/dataStructures/TreeNode";

class NumberNode extends TreeNode<number> {}
export class TreeNodeTest {
  // 创建一棵如下所示的树结构
  // 树节点添加节点的三种情况及操作（当要向树节点中添加子节点时）：
  /*
                                  树数据结构
            -------------------------root--------------------
           /                         |                      \
        node1                       node2                  node3
      /   |                       /      \                  |
 node4  node5                   node6   node7              node8
    |                            |         |
  node9                        node10  node11
                                           |
                                         node12
    */

  public static createTree(): NumberNode {
    let root: NumberNode = new NumberNode(0, undefined, "root");
    let node1: NumberNode = new NumberNode(1, root, "node1");
    let node2: NumberNode = new NumberNode(2, root, "node2");
    let node3: NumberNode = new NumberNode(3, root, "node3");

    let node4: NumberNode = new NumberNode(4, node1, "node4");
    let node5: NumberNode = new NumberNode(5, node1, "node5");

    let node6: NumberNode = new NumberNode(6, node2, "node6");
    let node7: NumberNode = new NumberNode(7, node2, "node7");

    let node8: NumberNode = new NumberNode(8, node3, "node8");

    let node9: NumberNode = new NumberNode(9, node4, "node9");

    let node10: NumberNode = new NumberNode(10, node6, "node10");

    let node11: NumberNode = new NumberNode(11, node7, "node11");

    let node12: NumberNode = new NumberNode(12, node11, "node12");

    return root;
  }
  // 辅助方法，根据输入的枚举器，线性输出节点内容
  public static outputNodesInfo(iter: IEnumerator<TreeNode<number>>): string {
    let output: string[] = [];
    let current: TreeNode<number> | undefined = undefined;
    while (iter.moveNext()) {
      current = iter.current;
      if (current !== undefined) {
        output.push(current.name);
      }
    }
    return " 实际输出：[" + output.join(", ") + " ] ";
  }
}

function run() {
  let root: NumberNode = TreeNodeTest.createTree();
  let iter: IEnumerator<TreeNode<number>>; // IEnumerator 枚举器
  let current: TreeNode<number> | undefined = undefined;
  //枚举器持有的当前节点

  console.log(" 1、depthFirst_left2rihgt_top2bottom_enumerator ");
  // 下面代码应该输出的结果为：[ root , node1 , node4 , node9 , node5 , node2 ,node6 , node10 , node7 , node11 , node12 , node3 , node8 ]
  console.log(
    " 应该输出：[ root , node1 , node4 , node9 , node5 , node2 ,node6 , node10 , node7 , node11 , node12 , node3 , node8 ] "
  );
  iter = NodeEnumeratorFactory.create_df_l2r_t2b_iter<number>(root);
  while (iter.moveNext()) {
    current = iter.current;
    if (current !== undefined) {
      // 根据当前的depth获得缩进字符串（下面使用空格字符），然后和节点名合成当前节点输出路径
      console.log(current.repeatString(current.depth * 4, " ") + current.name);
    }
  }

  // 借助辅助方法的验证方法
  // 下面的代码线性输出所有遍历结果，验证迭代的正确性
  console.log(" 2、depthFirst_right2left_top2bottom_enumerator ");
  console.log(
    " 应该输出：[root, node3, node8, node2, node7, node11, node12, node6, node10, node1, node5, node4, node9]"
  );
  iter = NodeEnumeratorFactory.create_df_r2l_t2b_iter<number>(root);
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 3、depthFirst_left2right_bottom2top_enumerator ");
  iter = NodeEnumeratorFactory.create_df_l2r_b2t_iter<number>(root);
  console.log(
    " 应该输出：[node9, node4, node5, node1, node10, node6, node12, node11, node7, node2, node8, node3, root ]"
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 4、depthFirst_right2left_bottom2top_enumerator ");
  iter = NodeEnumeratorFactory.create_df_r2l_b2t_iter<number>(root);
  console.log(
    " 应该输出：[node8, node3, node12, node11, node7, node10, node6, node2, node5, node9, node4, node1, root ]"
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 5、breadthFirst_left2right_top2bottom_enumerator ");
  iter = NodeEnumeratorFactory.create_bf_l2r_t2b_iter<number>(root);
  console.log(
    " 应该输出：[root, node1, node2, node3, node4, node5, node6, node7, node8, node9, node10, node11, node12 ]"
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 6、breadthFirst_rihgt2left_top2bottom_enumerator ");
  iter = NodeEnumeratorFactory.create_bf_r2l_t2b_iter<number>(root);
  console.log(
    " 应该输出：[root, node3, node2, node1, node8, node7, node6, node5, node4, node11, node10, node9, node12 ]"
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 7、breadthFirst_left2right_bottom2top_enumerator ");
  iter = NodeEnumeratorFactory.create_bf_l2r_b2t_iter<number>(root);
  console.log(
    " 应该输出：[node12, node9, node10, node11, node4, node5, node6, node7, node8, node1, node2, node3, root ]"
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));

  console.log(" 8、breadthFirst_right2left_bottom2top_enumerator ");
  iter = NodeEnumeratorFactory.create_bf_r2l_b2t_iter<number>(root);
  console.log(
    " 应该输出：[node12, node11, node10, node9, node8, node7, node6, node5, node4, node3, node2, node1, root ] "
  );
  console.log(TreeNodeTest.outputNodesInfo(iter));
}
run();
