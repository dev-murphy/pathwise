import type { Node, Edge } from '@vue-flow/core'

const STORAGE_KEY = 'pathwise_form'

export interface StoredForm {
  nodes: Node[]
  edges: Edge[]
}

export function useFormStore() {
  function save(nodes: Node[], edges: Edge[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
    } catch {
      console.warn('[useFormStore] Failed to save form to localStorage')
    }
  }

  function load(): StoredForm | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as StoredForm) : null
    } catch {
      console.warn('[useFormStore] Failed to load form from localStorage')
      return null
    }
  }

  function clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  return { save, load, clear }
}
