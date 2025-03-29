import StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
declare global {
  interface Window {
    __core: {
      state: StateCore | null
    }
  }
}
export {}
