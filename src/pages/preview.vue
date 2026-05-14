<script setup lang="ts">
import type { Node, Edge } from '@vue-flow/core'
import { useFormStore } from '~/composables/useFormStore'
import type { FieldOption, QuestionNodeData } from '~/types/flow'

const { load } = useFormStore()

const form = load()
const nodes: Node[] = form?.nodes ?? []
const edges: Edge[] = form?.edges ?? []

// Build adjacency map: nodeId -> outgoing edges
const outgoing = new Map<string, Edge[]>()
nodes.forEach((n) => outgoing.set(n.id, []))
edges.forEach((e) => outgoing.get(e.source)?.push(e))

// Find start node
const startNode = nodes.find((n) => n.data.isStart) ?? nodes[0] ?? null

// ─── Form traversal state ─────────────────────────────────────────────────────

const currentNodeId = ref<string | null>(startNode?.id ?? null)
const history = ref<string[]>([]) // stack of visited node IDs
const completed = ref(false)

// Current field values keyed by nodeId
const answers = ref<Record<string, string | string[]>>({})

const currentNode = computed((): Node | null =>
  currentNodeId.value ? (nodes.find((n) => n.id === currentNodeId.value) ?? null) : null
)

const currentData = computed((): Partial<QuestionNodeData> =>
  (currentNode.value?.data as Partial<QuestionNodeData>) ?? {}
)

const currentEdges = computed((): Edge[] =>
  currentNodeId.value ? (outgoing.get(currentNodeId.value) ?? []) : []
)

const isMultiBranch = computed(() =>
  ['dropdown', 'radio', 'multiselect'].includes(currentData.value.fieldType ?? '')
)

const currentAnswer = computed({
  get: () => answers.value[currentNodeId.value ?? ''] ?? (isMultiBranch.value ? [] : ''),
  set: (v) => {
    if (currentNodeId.value) answers.value[currentNodeId.value] = v
  },
})

// Progress
const totalNodes = nodes.length
const visitedCount = computed(() => history.value.length + (currentNodeId.value ? 1 : 0))

function navigate(targetNodeId: string) {
  if (currentNodeId.value) history.value.push(currentNodeId.value)
  currentNodeId.value = targetNodeId
}

function onNext() {
  // Single branch: follow the first outgoing edge
  const nextEdge = currentEdges.value[0]
  if (nextEdge) {
    navigate(nextEdge.target)
  } else {
    completed.value = true
  }
}

function onChoose(edge: Edge) {
  // For multi-branch: follow the chosen edge
  navigate(edge.target)
}

function onBack() {
  const prev = history.value.pop()
  if (prev) currentNodeId.value = prev
  completed.value = false
}

function onRestart() {
  history.value = []
  currentNodeId.value = startNode?.id ?? null
  answers.value = {}
  completed.value = false
}

function setAnswer(val: string | string[]) {
  currentAnswer.value = val
}

function toggleMultiValue(val: string) {
  const curr = Array.isArray(currentAnswer.value) ? currentAnswer.value : []
  const idx = curr.indexOf(val)
  if (idx === -1) setAnswer([...curr, val])
  else setAnswer(curr.filter((v) => v !== val))
}

function isMultiSelected(val: string): boolean {
  return Array.isArray(currentAnswer.value) && currentAnswer.value.includes(val)
}

function getStringAnswer(): string {
  return typeof currentAnswer.value === 'string' ? currentAnswer.value : ''
}
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppNav show-back back-label="Dashboard" back-to="/dashboard" />

    <!-- No form -->
    <div v-if="!startNode" class="grow flex flex-col items-center justify-center gap-y-4 text-center px-6">
      <AlertCircle class="w-12 h-12 text-muted" />
      <p class="text-muted font-mono text-sm">No form found. Build one in the dashboard first.</p>
      <RouterLink
        to="/dashboard"
        class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
      >
        Open Builder
      </RouterLink>
    </div>

    <!-- Completed state -->
    <div v-else-if="completed" class="grow flex flex-col items-center justify-center gap-y-6 text-center px-6">
      <div class="w-16 h-16 rounded-full bg-accent/10 border border-accent flex items-center justify-center">
        <Eye class="w-8 h-8 text-accent" />
      </div>
      <div class="flex flex-col gap-y-1">
        <h2 class="text-text font-head font-bold text-2xl">All done!</h2>
        <p class="text-muted font-mono text-sm">You've reached the end of this form.</p>
      </div>
      <button
        class="px-5 py-2 bg-surface-2 border border-border text-text font-mono text-sm rounded-lg hover:border-accent hover:text-accent transition"
        @click="onRestart"
      >
        Start over
      </button>
    </div>

    <!-- Form step -->
    <div v-else class="grow flex flex-col items-center justify-center px-6 py-10">
      <div class="w-full max-w-lg flex flex-col gap-y-6">
        <!-- Progress -->
        <div class="flex items-center gap-x-3">
          <div class="grow h-0.5 bg-border rounded-full overflow-hidden">
            <div
              class="h-full bg-accent transition-all duration-300 rounded-full"
              :style="{ width: `${(visitedCount / totalNodes) * 100}%` }"
            />
          </div>
          <span class="text-[10px] font-mono text-muted shrink-0">
            {{ visitedCount }} / {{ totalNodes }}
          </span>
        </div>

        <!-- Question card -->
        <div class="bg-surface border border-border rounded-xl p-6 flex flex-col gap-y-4">
          <div class="flex items-start gap-x-2">
            <h2 class="text-text font-mono text-base leading-relaxed grow">
              {{ currentData.label }}
              <span v-if="currentData.required" class="text-accent-3 font-bold ml-0.5">*</span>
            </h2>
          </div>

          <!-- Text -->
          <input
            v-if="currentData.fieldType === 'text'"
            :value="getStringAnswer()"
            type="text"
            :placeholder="`Enter ${currentData.label?.toLowerCase()}...`"
            class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-3 py-2 text-text text-sm rounded-lg font-mono transition-colors"
            @input="setAnswer(($event.target as HTMLInputElement).value)"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="currentData.fieldType === 'textarea'"
            :value="getStringAnswer()"
            rows="4"
            :placeholder="`Enter ${currentData.label?.toLowerCase()}...`"
            class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-3 py-2 text-text text-sm rounded-lg font-mono transition-colors resize-none"
            @input="setAnswer(($event.target as HTMLTextAreaElement).value)"
          />

          <!-- Number -->
          <input
            v-else-if="currentData.fieldType === 'number'"
            :value="getStringAnswer()"
            type="number"
            placeholder="Enter a number..."
            class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-3 py-2 text-text text-sm rounded-lg font-mono transition-colors"
            @input="setAnswer(($event.target as HTMLInputElement).value)"
          />

          <!-- Checkbox (single) -->
          <label
            v-else-if="currentData.fieldType === 'checkbox'"
            class="flex items-center gap-x-3 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="getStringAnswer() === 'true'"
              class="accent-accent w-4 h-4 cursor-pointer"
              @change="setAnswer(($event.target as HTMLInputElement).checked ? 'true' : 'false')"
            />
            <span class="text-text text-sm font-mono">{{ currentData.label }}</span>
          </label>

          <!-- Dropdown -->
          <select
            v-else-if="currentData.fieldType === 'dropdown'"
            :value="getStringAnswer()"
            class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-3 py-2 text-text text-sm rounded-lg font-mono transition-colors cursor-pointer"
            @change="setAnswer(($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled>-- Select an option --</option>
            <option
              v-for="opt in (currentData.options as FieldOption[])"
              :key="opt.id"
              :value="opt.id"
            >
              {{ opt.label }}
            </option>
          </select>

          <!-- Radio -->
          <div v-else-if="currentData.fieldType === 'radio'" class="flex flex-col gap-y-2">
            <label
              v-for="opt in (currentData.options as FieldOption[])"
              :key="opt.id"
              class="flex items-center gap-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors duration-150"
              :class="getStringAnswer() === opt.id
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border hover:border-accent/50'"
            >
              <input
                type="radio"
                :value="opt.id"
                :checked="getStringAnswer() === opt.id"
                class="accent-accent cursor-pointer"
                @change="setAnswer(opt.id)"
              />
              <span class="text-sm font-mono">{{ opt.label }}</span>
            </label>
          </div>

          <!-- Multiselect -->
          <div v-else-if="currentData.fieldType === 'multiselect'" class="flex flex-col gap-y-2">
            <label
              v-for="opt in (currentData.options as FieldOption[])"
              :key="opt.id"
              class="flex items-center gap-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors duration-150"
              :class="isMultiSelected(opt.id)
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border hover:border-accent/50'"
            >
              <input
                type="checkbox"
                :checked="isMultiSelected(opt.id)"
                class="accent-accent cursor-pointer"
                @change="toggleMultiValue(opt.id)"
              />
              <span class="text-sm font-mono">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between gap-x-3">
          <button
            v-if="history.length > 0"
            class="flex items-center gap-x-2 px-4 py-2 text-sm font-mono text-muted hover:text-accent border border-border hover:border-accent rounded-lg transition-colors"
            @click="onBack"
          >
            <ArrowLeft class="w-4 h-4" />
            Back
          </button>
          <div v-else />

          <!-- Multi-branch: show option buttons as next actions -->
          <div v-if="isMultiBranch && currentEdges.length > 0" class="flex flex-wrap gap-2 justify-end">
            <button
              v-for="edge in currentEdges"
              :key="edge.id"
              class="px-4 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
              @click="onChoose(edge)"
            >
              {{ edge.label || 'Next' }}
            </button>
          </div>

          <!-- Single branch or no options connected yet -->
          <button
            v-else
            class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
            @click="onNext"
          >
            {{ currentEdges.length === 0 ? 'Finish' : 'Next →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
