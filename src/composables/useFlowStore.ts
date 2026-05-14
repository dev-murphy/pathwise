import type { Node, Edge } from '@vue-flow/core'
import type { Flow, FlowAnalytics, FlowStatus } from '~/types/flow'

const INDEX_KEY = 'pathwise_flows_index'
const FLOW_KEY_PREFIX = 'pathwise_flow:'
const LEGACY_FORM_KEY = 'pathwise_form'

const flowKey = (id: string): string => `${FLOW_KEY_PREFIX}${id}`

const emptyAnalytics = (): FlowAnalytics => ({ visits: 0, completions: 0 })

function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeIndex(ids: string[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids))
}

function readFlow(id: string): Flow | null {
  try {
    const raw = localStorage.getItem(flowKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Flow
    if (!parsed.analytics) parsed.analytics = emptyAnalytics()
    return parsed
  } catch {
    return null
  }
}

function writeFlow(flow: Flow): void {
  localStorage.setItem(flowKey(flow.id), JSON.stringify(flow))
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function useFlowStore() {
  function migrateLegacy(): void {
    try {
      const raw = localStorage.getItem(LEGACY_FORM_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { nodes?: Node[]; edges?: Edge[] }
      const id = newId()
      const now = Date.now()
      const flow: Flow = {
        id,
        name: 'Untitled flow',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        analytics: emptyAnalytics(),
        nodes: parsed.nodes ?? [],
        edges: parsed.edges ?? [],
      }
      writeFlow(flow)
      writeIndex([...readIndex(), id])
      localStorage.removeItem(LEGACY_FORM_KEY)
    } catch {
      // ignore malformed legacy data
    }
  }

  function listFlows(): Flow[] {
    return readIndex()
      .map((id) => readFlow(id))
      .filter((f): f is Flow => f !== null)
  }

  function getFlow(id: string): Flow | null {
    return readFlow(id)
  }

  function createFlow(name: string): Flow {
    const id = newId()
    const now = Date.now()
    const flow: Flow = {
      id,
      name: name.trim() || 'Untitled flow',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      analytics: emptyAnalytics(),
      nodes: [],
      edges: [],
    }
    writeFlow(flow)
    writeIndex([...readIndex(), id])
    return flow
  }

  function renameFlow(id: string, name: string): Flow | null {
    const flow = readFlow(id)
    if (!flow) return null
    flow.name = name.trim() || flow.name
    flow.updatedAt = Date.now()
    writeFlow(flow)
    return flow
  }

  function updateStatus(id: string, status: FlowStatus): Flow | null {
    const flow = readFlow(id)
    if (!flow) return null
    if (flow.status !== status) {
      flow.status = status
      flow.updatedAt = Date.now()
      if (status === 'published' && !flow.publishedAt) {
        flow.publishedAt = Date.now()
      }
      writeFlow(flow)
    }
    return flow
  }

  function saveGraph(id: string, nodes: Node[], edges: Edge[]): Flow | null {
    const flow = readFlow(id)
    if (!flow) return null
    flow.nodes = nodes
    flow.edges = edges
    flow.updatedAt = Date.now()
    writeFlow(flow)
    return flow
  }

  function incrementAnalytic(id: string, key: keyof FlowAnalytics): Flow | null {
    const flow = readFlow(id)
    if (!flow) return null
    flow.analytics = { ...flow.analytics, [key]: (flow.analytics[key] ?? 0) + 1 }
    writeFlow(flow)
    return flow
  }

  function deleteFlow(id: string): void {
    writeIndex(readIndex().filter((x) => x !== id))
    localStorage.removeItem(flowKey(id))
  }

  return {
    migrateLegacy,
    listFlows,
    getFlow,
    createFlow,
    renameFlow,
    updateStatus,
    saveGraph,
    incrementAnalytic,
    deleteFlow,
  }
}
