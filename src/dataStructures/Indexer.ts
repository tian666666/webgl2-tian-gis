/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-01-29 22:17:26
 * @LastEditTime: 2023-01-29 22:20:32
 * @LastEditors: tianyw
 */
// 枚举器

// 回调函数类型定义
export type Indexer = (len: number, idx: number) => number;
// 实现获取从左到右的索引号
export function IndexerL2R(len: number, idx: number): number {
  return idx;
}
// 实现获取从右到左的索引号
export function IndexerR2L(len: number, idx: number): number {
  return len - idx - 1;
}
