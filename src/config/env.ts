/**
 * 检查dev env
 * @returns
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
