<script setup lang="ts">
import type { Node, Edge } from '@vue-flow/core'
import { useFormStore } from '~/composables/useFormStore'
import { FIELD_TYPE_LABELS } from '~/types/flow'
import { FIELD_TYPE_ICONS } from '~/types/icons'
import type { FieldType } from '~/types/flow'

const { load } = useFormStore()

const form = load()
const nodes: Node[] = form?.nodes ?? []
const edges: Edge[] = form?.edges ?? []

// ─── Derived stats ────────────────────────────────────────────────────────────

const totalFields = nodes.length
const totalConnections = edges.length
const requiredCount = nodes.filter((n) => n.data.required).length
const startNode = nodes.find((n) => n.data.isStart)

// Field type breakdown
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

// Reachability: nodes with no incoming edges (other than start)
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
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppNav show-back back-label="Dashboard" back-to="/dashboard" />

    <!-- No form -->
    <div v-if="!nodes.length" class="grow flex flex-col items-center justify-center gap-y-4 text-center px-6">
      <ChartBar class="w-12 h-12 text-muted" />
      <p class="text-muted font-mono text-sm">No form data found. Build one in the dashboard first.</p>
      <RouterLink
        to="/dashboard"
        class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
      >
        Open Builder
      </RouterLink>
    </div>

    <div v-else class="grow px-6 py-8 max-w-3xl mx-auto w-full flex flex-col gap-y-8">
      <!-- Header -->
      <div class="flex items-center gap-x-3">
        <ChartBar class="w-6 h-6 text-accent" />
        <h1 class="text-text font-head font-bold text-xl">Form Stats</h1>
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
