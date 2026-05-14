<script setup lang="ts">
import type { Node, Edge } from '@vue-flow/core'
import { useRoute } from 'vue-router'
import { useFlowStore } from '~/composables/useFlowStore'
import { FIELD_TYPE_LABELS } from '~/types/flow'
import { FIELD_TYPE_ICONS } from '~/types/icons'
import type { FieldType } from '~/types/flow'

const route = useRoute<'/stats/[id]'>()
const flowId = String(route.params.id)
const { getFlow } = useFlowStore()

const flow = getFlow(flowId)
const nodes: Node[] = flow?.nodes ?? []
const edges: Edge[] = flow?.edges ?? []

// ─── Derived structural stats ─────────────────────────────────────────────────

const totalFields = nodes.length
const totalConnections = edges.length
const requiredCount = nodes.filter((n) => n.data.required).length
const startNode = nodes.find((n) => n.data.isStart)

const typeCounts = computed(() => {
  const counts: Partial<Record<FieldType, number>> = {}
  nodes.forEach((n) => {
    const ft = (n.data.fieldType as FieldType) ?? 'text'
    counts[ft] = (counts[ft] ?? 0) + 1
  })
  return Object.entries(counts).map(([type, count]) => ({
    type: type as FieldType,
    label: FIELD_TYPE_LABELS[type as FieldType],
    icon: FIELD_TYPE_ICONS[type as FieldType],
    count: count as number,
  })).sort((a, b) => b.count - a.count)
})

const hasIncoming = new Set<string>(edges.map((e) => e.target))
const hasOutgoing = new Set<string>(edges.map((e) => e.source))

const unreachable = nodes.filter(
  (n) => !n.data.isStart && !hasIncoming.has(n.id)
)
const leafNodes = nodes.filter((n) => !hasOutgoing.has(n.id))
const multiBranchFields = nodes.filter((n) =>
  ['dropdown', 'radio', 'multiselect'].includes(n.data.fieldType as string)
)

const stats = computed(() => [
  { label: 'Total fields', value: totalFields },
  { label: 'Connections', value: totalConnections },
  { label: 'Required fields', value: requiredCount },
  { label: 'Branching fields', value: multiBranchFields.length },
])

// ─── Usage analytics (only from /p/:id) ───────────────────────────────────────

const visits = computed(() => flow?.analytics?.visits ?? 0)
const completions = computed(() => flow?.analytics?.completions ?? 0)
const completionRate = computed(() =>
  visits.value > 0 ? Math.round((completions.value / visits.value) * 100) : 0,
)
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppNav show-back back-label="Builder" :back-to="`/flows/${flowId}`" />

    <!-- No flow -->
    <div v-if="!flow" class="grow flex flex-col items-center justify-center gap-y-4 text-center px-6">
      <ChartBar class="w-12 h-12 text-muted" />
      <p class="text-muted font-mono text-sm">Flow not found.</p>
      <RouterLink
        to="/dashboard"
        class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
      >
        Back to flows
      </RouterLink>
    </div>

    <!-- No fields -->
    <div v-else-if="!nodes.length" class="grow flex flex-col items-center justify-center gap-y-4 text-center px-6">
      <ChartBar class="w-12 h-12 text-muted" />
      <p class="text-muted font-mono text-sm">No fields in this flow yet. Add some in the builder first.</p>
      <RouterLink
        :to="`/flows/${flowId}`"
        class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
      >
        Open Builder
      </RouterLink>
    </div>

    <div v-else class="grow px-6 py-8 max-w-3xl mx-auto w-full flex flex-col gap-y-8">
      <!-- Header -->
      <div class="flex items-center gap-x-3">
        <ChartBar class="w-6 h-6 text-accent" />
        <h1 class="text-text font-head font-bold text-xl">{{ flow.name }} — Stats</h1>
        <span v-if="startNode" class="text-xs font-mono text-muted ml-auto">
          Start: {{ startNode.data.label }}
        </span>
      </div>

      <!-- Overview cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex flex-col gap-y-1 p-4 bg-surface border border-border rounded-xl"
        >
          <span class="text-2xl font-head font-black text-accent">{{ stat.value }}</span>
          <span class="text-[11px] font-mono text-muted uppercase tracking-wider">{{ stat.label }}</span>
        </div>
      </div>

      <!-- Usage (publish-link analytics) -->
      <div class="flex flex-col gap-y-3">
        <div class="flex items-baseline gap-x-3">
          <h2 class="text-xs font-mono text-muted uppercase tracking-widest">Usage</h2>
          <span class="text-[10px] font-mono text-muted italic">From the publish link only — preview visits are not counted.</span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col gap-y-1 p-4 bg-surface border border-border rounded-xl">
            <span class="text-2xl font-head font-black text-accent">{{ visits }}</span>
            <span class="text-[11px] font-mono text-muted uppercase tracking-wider">Visits</span>
          </div>
          <div class="flex flex-col gap-y-1 p-4 bg-surface border border-border rounded-xl">
            <span class="text-2xl font-head font-black text-accent">{{ completions }}</span>
            <span class="text-[11px] font-mono text-muted uppercase tracking-wider">Completions</span>
          </div>
          <div class="flex flex-col gap-y-1 p-4 bg-surface border border-border rounded-xl">
            <span class="text-2xl font-head font-black text-accent">{{ completionRate }}%</span>
            <span class="text-[11px] font-mono text-muted uppercase tracking-wider">Completion rate</span>
          </div>
        </div>
      </div>

      <!-- Field type breakdown -->
      <div class="flex flex-col gap-y-3">
        <h2 class="text-xs font-mono text-muted uppercase tracking-widest">Field type breakdown</h2>
        <div class="flex flex-col gap-y-2">
          <div
            v-for="item in typeCounts"
            :key="item.type"
            class="flex items-center gap-x-3 p-3 bg-surface border border-border rounded-lg"
          >
            <component :is="item.icon" class="w-4 h-4 text-accent shrink-0" />
            <span class="text-text text-sm font-mono grow">{{ item.label }}</span>
            <div class="flex items-center gap-x-2">
              <div class="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent rounded-full"
                  :style="{ width: `${(item.count / totalFields) * 100}%` }"
                />
              </div>
              <span class="text-xs font-mono text-muted w-4 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Graph analysis -->
      <div class="grid sm:grid-cols-2 gap-4">
        <!-- Unreachable nodes -->
        <div class="flex flex-col gap-y-2 p-4 bg-surface border border-border rounded-xl">
          <div class="flex items-center gap-x-2">
            <AlertCircle class="w-4 h-4 text-accent-3 shrink-0" />
            <h3 class="text-xs font-mono text-muted uppercase tracking-widest">Unreachable fields</h3>
          </div>
          <p v-if="!unreachable.length" class="text-xs font-mono text-muted italic">All fields are reachable.</p>
          <ul v-else class="flex flex-col gap-y-1">
            <li
              v-for="n in unreachable"
              :key="n.id"
              class="text-xs font-mono text-accent-3 truncate"
            >
              {{ n.data.label }}
            </li>
          </ul>
        </div>

        <!-- Leaf nodes (end points) -->
        <div class="flex flex-col gap-y-2 p-4 bg-surface border border-border rounded-xl">
          <div class="flex items-center gap-x-2">
            <Eye class="w-4 h-4 text-accent shrink-0" />
            <h3 class="text-xs font-mono text-muted uppercase tracking-widest">End points</h3>
          </div>
          <p v-if="!leafNodes.length" class="text-xs font-mono text-muted italic">No end points found.</p>
          <ul v-else class="flex flex-col gap-y-1">
            <li
              v-for="n in leafNodes"
              :key="n.id"
              class="text-xs font-mono text-text truncate"
            >
              {{ n.data.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
