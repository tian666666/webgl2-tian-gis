import { IEnumerator } from "./IEnumerator";
import { IndexerL2R, IndexerR2L } from "./Indexer";
import { NodeB2TEnumerator } from "./NodeB2TEnumerator";
import { NodeT2BEnumerator } from "./NodeT2BEnumerator";
import { Queue } from "./Queue";
import { Stack } from "./Stack";
import { TreeNode } from "./TreeNode";

export class NodeEnumeratorFactory {
  // 创建深度优先(stack)、从左到右（IndexerR2L）、从上到下的枚举器
  public static create_df_l2r_t2b_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(
      node,
      IndexerR2L,
      Stack
    );
    return iter;
  }
  // 创建深度优先（stack），从右到左（IndexerL2R）、从上到下的枚举器
  public static create_df_r2l_t2b_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(
      node,
      IndexerL2R,
      Stack
    );
    return iter;
  }
  // 创建广度优先（Queue）、从左到右（IndexerL2R）、从上到下的枚举器
  public static create_bf_l2r_t2b_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(
      node,
      IndexerL2R,
      Queue
    );
    return iter;
  }

  // 创建广度优先（Queue）、从左到右（IndexerR2L）、从上到下的枚举器
  public static create_bf_r2l_t2b_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(
      node,
      IndexerR2L,
      Queue
    );
    return iter;
  }

  // 上面都是从上到下遍历（先根）遍历
  // 下面都是从下到上遍历（后根）遍历，是对上面从上到下（先根）枚举器的包装

  // 创建深度优先、从左到右、从下到上的枚举
  public static create_df_l2r_b2t_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    // 向上转型，自动（向下转型，需要as或<>手动）
    let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator(
      NodeEnumeratorFactory.create_df_r2l_t2b_iter(node)
    );
    return iter;
  }
  // 创建深度优先、从右到左、从下到上的枚举
  public static create_df_r2l_b2t_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    // 向上转型，自动（向下转型，需要as或<>手动）
    let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator(
      NodeEnumeratorFactory.create_df_l2r_t2b_iter(node)
    );
    return iter;
  }
  // 创建广度优先、从左到右、从下到上的枚举
  public static create_bf_l2r_b2t_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    // 向上转型，自动（向下转型，需要as或<>手动）
    let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator(
      NodeEnumeratorFactory.create_bf_r2l_t2b_iter(node)
    );
    return iter;
  }

  // 创建广度优先、从右到左、从下到上的枚举
  public static create_bf_r2l_b2t_iter<T>(
    node: TreeNode<T> | undefined
  ): IEnumerator<TreeNode<T>> {
    // 向上转型，自动（向下转型，需要as或<>手动）
    let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator(
      NodeEnumeratorFactory.create_bf_l2r_t2b_iter(node)
    );
    return iter;
  }
}
