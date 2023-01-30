// 迭代器
export interface IEnumerator<T> {
  // 将迭代器重置为初始位置
  reset(): void;
  // 如果没越界， moveNext 将 current 设置为下一个元素并返回 true
  // 如果已越界， moveNext 返回 false
  moveNext(): boolean;
  // 获取当前的元素
  readonly current: T | undefined;
}
