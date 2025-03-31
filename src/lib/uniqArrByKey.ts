export function uniqArrByKey<T extends object>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>()
  return arr.filter((item) => {
    if (seen.has(item[key])) return false
    seen.add(item[key])
    return true
  })
}
