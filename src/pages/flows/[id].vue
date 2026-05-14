<script setup lang="ts">
import type { Node, Edge, Connection } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import type { NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import { useRoute, useRouter } from 'vue-router'
import { MULTI_BRANCH_TYPES, OPTIONS_TYPES } from '~/types/flow'
import type { FieldType, FieldOption, FlowStatus, QuestionNodeData } from '~/types/flow'
import { useFlowStore } from '~/composables/useFlowStore'

// ─── Route / flow load ────────────────────────────────────────────────────────

const route = useRoute<'/flows/[id]'>()
const router = useRouter()
const flowId = String(route.params.id)
const { getFlow, saveGraph, updateStatus, renameFlow } = useFlowStore()

const loadedFlow = getFlow(flowId)
if (!loadedFlow) {
  void router.replace('/dashboard')
}

// ─── State ────────────────────────────────────────────────────────────────────

const nodes = ref<Node[]>(loadedFlow?.nodes ?? [])
const edges = ref<Edge[]>(loadedFlow?.edges ?? [])
const flowName = ref(loadedFlow?.name ?? '')
const flowStatus = ref<FlowStatus>(loadedFlow?.status ?? 'draft')
const editingName = ref(false)
const nameDraft = ref(flowName.value)

const { fitView } = useVueFlow()

// ─── Selection ────────────────────────────────────────────────────────────────

const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const selectedEdgeNodeIds = ref<Set<string>>(new Set())

// ─── Start node ───────────────────────────────────────────────────────────────

function findStartId(list: Node[]): string | null {
  for (const n of list) {
    if ((n.data as { isStart?: boolean } | undefined)?.isStart) return n.id
  }
  return null
}

const startNodeId = ref<string | null>(findStartId(nodes.value as Node[]))

function computeNextId(list: Node[]): number {
  let max = 0
  for (const n of list) {
    const num = Number(n.id)
    if (Number.isFinite(num) && num > max) max = num
  }
  return max + 1
}

let nextId = computeNextId(nodes.value as Node[])

function setStartNode(id: string) {
  nodes.value.forEach((n) => { n.data = { ...n.data, isStart: n.id === id } })
  startNodeId.value = id
}

// ─── Panel mode ───────────────────────────────────────────────────────────────

type PanelMode = 'addField' | 'editField' | 'editAnswer' | 'pendingConnection'

const pendingConnection = ref<{ source: string; target: string } | null>(null)
const pendingOptionId = ref<string>('')

const panelMode = computed((): PanelMode => {
  if (pendingConnection.value !== null) return 'pendingConnection'
  if (selectedEdgeId.value !== null) return 'editAnswer'
  if (selectedNodeId.value !== null) return 'editField'
  return 'addField'
})

// ─── Field form state ─────────────────────────────────────────────────────────

const fieldLabel = ref('')
const fieldType = ref<FieldType>('text')
const fieldRequired = ref(false)
const fieldOptions = ref<FieldOption[]>([])
const newOptionText = ref('')
const fieldPlaceholder = ref('')
const fieldMaxLength = ref<number | null>(null)

const routeTargetOptions = computed(() =>
  (nodes.value as Node[])
    .filter((n: Node) => n.id !== selectedNodeId.value)
    .map((n: Node) => ({ id: n.id, label: n.data.label as string }))
)

function onAddOption() {
  const text = newOptionText.value.trim()
  if (!text) return
  fieldOptions.value.push({ id: String(Date.now()), label: text })
  newOptionText.value = ''
}

function onRemoveOption(id: string) {
  fieldOptions.value = fieldOptions.value.filter((o) => o.id !== id)
}

function onSetOptionTarget(optionId: string, targetNodeId: string) {
  const opt = fieldOptions.value.find((o) => o.id === optionId)
  if (opt) opt.targetNodeId = targetNodeId || undefined
}

function resetFieldForm() {
  fieldLabel.value = ''
  fieldType.value = 'text'
  fieldRequired.value = false
  fieldOptions.value = []
  newOptionText.value = ''
  fieldPlaceholder.value = ''
  fieldMaxLength.value = null
}

// ─── Edge sync ────────────────────────────────────────────────────────────────

function clearOutgoingEdges(nodeId: string) {
  const filtered: Edge[] = (edges.value as Edge[]).filter((e: Edge) => e.source !== nodeId)
  edges.value = filtered
}

function syncOptionEdges(nodeId: string, options: FieldOption[]) {
  clearOutgoingEdges(nodeId)
  options.forEach((opt) => {
    if (!opt.targetNodeId) return
    const edgeId = `e${nodeId}->${opt.targetNodeId}`
    edges.value.push({ id: edgeId, type: 'flow', source: nodeId, target: opt.targetNodeId, label: opt.label })
  })
}

// ─── Add / Save field ─────────────────────────────────────────────────────────

function onSave() {
  if (panelMode.value === 'editAnswer') { onSaveEdgeLabel(); return }

  const text = fieldLabel.value.trim()
  if (!text) return

  const isOptionType = OPTIONS_TYPES.includes(fieldType.value)
  const data: QuestionNodeData = {
    label: text,
    fieldType: fieldType.value,
    options: [...fieldOptions.value],
    isStart: false,
    required: fieldRequired.value,
    placeholder: fieldPlaceholder.value.trim() || undefined,
    maxLength: fieldMaxLength.value ?? undefined,
  }

  if (panelMode.value === 'editField' && selectedNodeId.value) {
    const nodeId = selectedNodeId.value
    const target = (nodes.value as Node[]).find((n: Node) => n.id === nodeId)
    if (target) {
      const wasStart = target.data.isStart as boolean
      target.data = { ...data, isStart: wasStart } as Record<string, unknown>
    }
    if (isOptionType) syncOptionEdges(nodeId, fieldOptions.value)
  } else {
    const id = String(nextId++)
    const isFirst = nodes.value.length === 0
    nodes.value.push({
      id,
      type: 'question',
      position: { x: 100 + Math.random() * 400, y: 80 + Math.random() * 300 },
      data: { ...data, isStart: isFirst },
    })
    if (isFirst) startNodeId.value = id
    resetFieldForm()
  }
}

// ─── Edge editing ─────────────────────────────────────────────────────────────

const edgeLabelText = ref('')

function onSaveEdgeLabel() {
  if (!selectedEdgeId.value) return
  const target = (edges.value as Edge[]).find((e: Edge) => e.id === selectedEdgeId.value)
  if (target) target.label = edgeLabelText.value.trim()
}

function onDeleteEdge() {
  if (!selectedEdgeId.value) return
  const idToRemove = selectedEdgeId.value
  const filtered: Edge[] = (edges.value as Edge[]).filter((e: Edge) => e.id !== idToRemove)
  edges.value = filtered
  selectedEdgeId.value = null
  selectedEdgeNodeIds.value = new Set()
  edgeLabelText.value = ''
}

// ─── Canvas events ────────────────────────────────────────────────────────────

function selectNode(node: { id: string; data?: Record<string, unknown> }) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  selectedEdgeNodeIds.value = new Set()
  edgeLabelText.value = ''
  pendingConnection.value = null
  pendingOptionId.value = ''
  const data = node.data as Partial<QuestionNodeData> | undefined
  fieldLabel.value = String(data?.label ?? '')
  fieldType.value = (data?.fieldType as FieldType) ?? 'text'
  fieldRequired.value = data?.required ?? false
  fieldOptions.value = data?.options ? [...(data.options as FieldOption[])] : []
  fieldPlaceholder.value = String(data?.placeholder ?? '')
  fieldMaxLength.value = (data?.maxLength as number | undefined) ?? null
}

function onNodeClick(payload: NodeMouseEvent) {
  selectNode(payload.node)
}

function onEdgeClick(payload: EdgeMouseEvent) {
  selectedNodeId.value = null
  selectedEdgeId.value = payload.edge.id
  selectedEdgeNodeIds.value = new Set([payload.edge.source, payload.edge.target])
  edgeLabelText.value = String(payload.edge.label ?? '')
  pendingConnection.value = null
  pendingOptionId.value = ''
  resetFieldForm()
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdgeNodeIds.value = new Set()
  edgeLabelText.value = ''
  pendingConnection.value = null
  pendingOptionId.value = ''
  resetFieldForm()
}

// ─── Drag-to-connect ──────────────────────────────────────────────────────────

const pendingSourceOptions = computed((): FieldOption[] => {
  if (!pendingConnection.value) return []
  const src = (nodes.value as Node[]).find((n: Node) => n.id === pendingConnection.value!.source)
  return (src?.data.options as FieldOption[]) ?? []
})

function onConnect(connection: Connection) {
  const sourceNode = (nodes.value as Node[]).find((n: Node) => n.id === connection.source)
  const srcFieldType = (sourceNode?.data as Partial<QuestionNodeData>)?.fieldType ?? 'text'
  const isMultiBranch = MULTI_BRANCH_TYPES.includes(srcFieldType)

  if (isMultiBranch) {
    pendingConnection.value = { source: connection.source!, target: connection.target! }
    pendingOptionId.value = ''
    selectedNodeId.value = null
    selectedEdgeId.value = null
  } else {
    pushEdge(connection.source!, connection.target!, '')
  }
}

function pushEdge(source: string, target: string, label: string) {
  const edgeId = `e${source}->${target}`
  if (edges.value.some((e) => e.id === edgeId)) return
  edges.value.push({ id: edgeId, type: 'flow', source, target, label })
}

function onConfirmConnection() {
  if (!pendingConnection.value) return
  const { source, target } = pendingConnection.value
  if (pendingOptionId.value) {
    const srcNode = (nodes.value as Node[]).find((n: Node) => n.id === source)
    if (srcNode) {
      const opts = (srcNode.data.options as FieldOption[]) ?? []
      const opt = opts.find((o) => o.id === pendingOptionId.value)
      if (opt) opt.targetNodeId = target
      srcNode.data = { ...srcNode.data, options: [...opts] } as Record<string, unknown>
      syncOptionEdges(source, opts)
    }
  } else {
    pushEdge(source, target, '')
  }
  pendingConnection.value = null
  pendingOptionId.value = ''
}

function onCancelConnection() {
  pendingConnection.value = null
  pendingOptionId.value = ''
}

// ─── Drag-to-reorder ──────────────────────────────────────────────────────────

const draggingIndex = ref<number | null>(null)

function onDragStart(index: number) { draggingIndex.value = index }

function onDragOver(index: number) {
  if (draggingIndex.value === null || draggingIndex.value === index) return
  const reordered = [...nodes.value]
  const [moved] = reordered.splice(draggingIndex.value, 1)
  reordered.splice(index, 0, moved)
  nodes.value = reordered
  draggingIndex.value = index
}

function onDragEnd() { draggingIndex.value = null }

// ─── Reorganize ───────────────────────────────────────────────────────────────

function reorganize() {
  if (nodes.value.length === 0) return
  const H_GAP = 280, V_GAP = 180, DISCONNECTED_X = 600
  const outgoing = new Map<string, string[]>()
  nodes.value.forEach((n) => outgoing.set(n.id, []))
  ;(edges.value as Edge[]).forEach((e: Edge) => { outgoing.get(e.source)?.push(e.target) })

  const positions = new Map<string, { x: number; y: number }>()
  const connected = new Set<string>((edges.value as Edge[]).flatMap((e: Edge) => [e.source, e.target]))
  let row = 0, disconnectedRow = 0

  nodes.value.forEach((n) => {
    if (!connected.has(n.id) && nodes.value.length > 1) {
      positions.set(n.id, { x: DISCONNECTED_X, y: disconnectedRow++ * V_GAP })
      return
    }
    const targets = outgoing.get(n.id) ?? []
    if (targets.length <= 1) {
      positions.set(n.id, { x: 0, y: row++ * V_GAP })
    } else {
      positions.set(n.id, { x: 0, y: row++ * V_GAP })
      const totalWidth = (targets.length - 1) * H_GAP
      targets.forEach((tid, i) => {
        if (!positions.has(tid)) positions.set(tid, { x: i * H_GAP - totalWidth / 2, y: row * V_GAP })
      })
      row++
    }
  })

  nodes.value.forEach((n) => { const pos = positions.get(n.id); if (pos) n.position = { ...pos } })
  nextTick(() => fitView({ padding: 0.2 }))
}

// ─── Persistence ──────────────────────────────────────────────────────────────

watch([nodes, edges], () => {
  saveGraph(flowId, nodes.value as Node[], edges.value as Edge[])
}, { deep: true })

// ─── Preview / Share / Status ─────────────────────────────────────────────────

function onPreview(): void {
  void window.open(`/preview/${flowId}`, '_blank')
}

function onShare(): void {
  if (flowStatus.value !== 'published') {
    alert('Publish this flow before sharing.')
    return
  }
  const url = `${window.location.origin}/p/${flowId}`
  navigator.clipboard.writeText(url).then(() => {
    alert('Publish link copied to clipboard!')
  })
}

function togglePublish(): void {
  const next: FlowStatus = flowStatus.value === 'published' ? 'draft' : 'published'
  updateStatus(flowId, next)
  flowStatus.value = next
}

// ─── Name editing ─────────────────────────────────────────────────────────────

function startEditName() {
  nameDraft.value = flowName.value
  editingName.value = true
}

function commitEditName() {
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== flowName.value) {
    renameFlow(flowId, trimmed)
    flowName.value = trimmed
  }
  editingName.value = false
}

function cancelEditName() {
  editingName.value = false
  nameDraft.value = flowName.value
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function onReset() {
  if (!window.confirm('Clear all fields in this flow? The flow itself will remain.')) return
  nodes.value = []
  edges.value = []
  nextId = 1
  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdgeNodeIds.value = new Set()
  edgeLabelText.value = ''
  pendingConnection.value = null
  pendingOptionId.value = ''
  startNodeId.value = null
  draggingIndex.value = null
  resetFieldForm()
}
</script>

<template>
  <div v-if="loadedFlow" class="h-screen bg-bg flex flex-col">
    <AppNav
      show-back
      back-label="Flows"
      back-to="/dashboard"
      show-reset
      show-fit-view
      show-preview
      show-share
      @reset="onReset"
      @fit-view="fitView({ padding: 0.2 })"
      @preview="onPreview"
      @share="onShare"
    >
      <template #actions>
        <!-- Flow name -->
        <div class="flex items-center gap-x-2 mr-2">
          <input
            v-if="editingName"
            v-model="nameDraft"
            autofocus
            class="bg-surface-2 border border-accent focus:outline-none px-2 py-1 text-text text-xs font-mono rounded w-44"
            @keydown.enter="commitEditName"
            @keydown.esc="cancelEditName"
            @blur="commitEditName"
          />
          <button
            v-else
            class="text-text font-mono text-xs hover:text-accent transition-colors"
            :title="'Rename'"
            @click="startEditName"
          >
            {{ flowName }}
          </button>

          <!-- Status pill / toggle -->
          <button
            class="flex items-center gap-x-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border transition-colors"
            :class="flowStatus === 'published'
              ? 'border-accent text-accent bg-accent/10 hover:bg-accent/20'
              : 'border-border text-muted bg-surface-2 hover:border-accent hover:text-accent'"
            :title="flowStatus === 'published' ? 'Unpublish' : 'Publish'"
            @click="togglePublish"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="flowStatus === 'published' ? 'bg-accent' : 'bg-muted'" />
            {{ flowStatus }}
          </button>
        </div>
      </template>
    </AppNav>

    <div class="grow flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-75 h-full bg-surface border-r border-border flex flex-col divide-y divide-border shrink-0">
        <!-- Main panel -->
        <div class="p-4 shrink-0">
          <ConnectionPanel
            v-if="panelMode === 'pendingConnection'"
            :source-options="pendingSourceOptions"
            :option-id="pendingOptionId"
            @update:option-id="pendingOptionId = $event"
            @confirm="onConfirmConnection"
            @cancel="onCancelConnection"
          />

          <EdgePanel
            v-else-if="panelMode === 'editAnswer'"
            :edge-label-text="edgeLabelText"
            @update:edge-label-text="edgeLabelText = $event"
            @save="onSaveEdgeLabel"
            @delete="onDeleteEdge"
          />

          <FieldPanel
            v-else
            :mode="panelMode as 'addField' | 'editField'"
            :field-label="fieldLabel"
            :field-type="fieldType"
            :field-required="fieldRequired"
            :field-options="fieldOptions"
            :new-option-text="newOptionText"
            :route-target-options="routeTargetOptions"
            :field-placeholder="fieldPlaceholder"
            :field-max-length="fieldMaxLength"
            @update:field-label="fieldLabel = $event"
            @update:field-type="fieldType = $event"
            @update:field-required="fieldRequired = $event"
            @update:new-option-text="newOptionText = $event"
            @update:field-placeholder="fieldPlaceholder = $event"
            @update:field-max-length="fieldMaxLength = $event"
            @add-option="onAddOption"
            @remove-option="onRemoveOption"
            @set-option-target="onSetOptionTarget"
            @save="onSave"
          />
        </div>

        <!-- Field list -->
        <FieldList
          v-if="nodes.length"
          :nodes="nodes"
          :start-node-id="startNodeId"
          :selected-edge-node-ids="selectedEdgeNodeIds"
          :dragging-index="draggingIndex"
          @set-start="setStartNode"
          @drag-start="onDragStart"
          @drag-over="onDragOver"
          @drag-end="onDragEnd"
          @reorganize="reorganize"
        />
      </aside>

      <!-- Canvas -->
      <main class="w-full h-full relative">
        <FlowCanvas
          :nodes="nodes"
          :edges="edges"
          @update:nodes="nodes = $event"
          @update:edges="edges = $event"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
          @connect="onConnect"
        />
      </main>
    </div>
  </div>
</template>
