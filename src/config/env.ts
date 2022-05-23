/**
 * 检查是否是开发环境
 * @returns
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
