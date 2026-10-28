import { registerSW } from 'virtual:pwa-register'

const listeners = new Set()

export function onPwaNeedRefresh(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let updateSWRef = null

export function applyPwaUpdate() {
  if (updateSWRef) updateSWRef(true)
}

updateSWRef = registerSW({
  immediate: true,
  onNeedRefresh() {
    for (const listener of listeners) listener()
  },
})
