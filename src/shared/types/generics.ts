export type Nullable<T> = T | null
export type NullableObj<T> = {
  [P in keyof T]: T[P] | null
}
export type Optional<T> = Partial<T>
