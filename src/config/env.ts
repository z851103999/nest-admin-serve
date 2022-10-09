/**
 * 检查开发环境 env
 * @returns
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
