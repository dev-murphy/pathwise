<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFlowStore } from '~/composables/useFlowStore'
import type { Flow } from '~/types/flow'

const router = useRouter()
const { migrateLegacy, listFlows, createFlow, renameFlow, updateStatus, deleteFlow } = useFlowStore()

migrateLegacy()

const flows = ref<Flow[]>(listFlows())

function refresh() {
  flows.value = listFlows()
}

// ─── Create ───────────────────────────────────────────────────────────────────

function onCreate() {
  const flow = createFlow('Untitled flow')
  void router.push(`/flows/${flow.id}`)
}

// ─── Open ─────────────────────────────────────────────────────────────────────

function onOpen(id: string) {
  void router.push(`/flows/${id}`)
}

// ─── Inline rename ────────────────────────────────────────────────────────────

const renamingId = ref<string | null>(null)
const renameDraft = ref('')

function startRename(id: string, name: string) {
  renamingId.value = id
  renameDraft.value = name
}

function commitRename() {
  if (!renamingId.value) return
  const trimmed = renameDraft.value.trim()
  if (trimmed) {
    renameFlow(renamingId.value, trimmed)
    refresh()
  }
  renamingId.value = null
}

function cancelRename() {
  renamingId.value = null
}

// ─── Publish toggle ───────────────────────────────────────────────────────────

function togglePublish(id: string, status: string) {
  updateStatus(id, status === 'published' ? 'draft' : 'published')
  refresh()
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function onDelete(id: string, name: string) {
  if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return
  deleteFlow(id)
  refresh()
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppNav />

    <main class="grow px-6 py-8 max-w-5xl mx-auto w-full flex flex-col gap-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-4">
        <div class="flex flex-col gap-y-1">
          <h1 class="text-text font-head font-bold text-2xl">Your flows</h1>
          <p class="text-muted font-mono text-xs">Create, edit, and publish conditional forms.</p>
        </div>
        <button
          class="flex items-center gap-x-2 px-4 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
          @click="onCreate"
        >
          <span class="text-base leading-none">+</span>
          Create flow
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="!flows.length"
        class="grow flex flex-col items-center justify-center gap-y-4 text-center px-6 py-16 border border-dashed border-border rounded-xl"
      >
        <AlertCircle class="w-12 h-12 text-muted" />
        <p class="text-muted font-mono text-sm">No flows yet. Create your first one to get started.</p>
        <button
          class="px-5 py-2 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition"
          @click="onCreate"
        >
          Create flow
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="flow in flows"
          :key="flow.id"
          class="flex flex-col gap-y-4 p-4 bg-surface border border-border rounded-xl hover:border-accent transition-colors group"
        >
          <!-- Top: name + status -->
          <div class="flex items-start justify-between gap-x-2">
            <input
              v-if="renamingId === flow.id"
              v-model="renameDraft"
              autofocus
              class="bg-surface-2 border border-accent focus:outline-none px-2 py-1 text-text text-sm font-mono rounded grow"
              @keydown.enter="commitRename"
              @keydown.esc="cancelRename"
              @blur="commitRename"
            />
            <button
              v-else
              class="text-text font-head font-bold text-base text-left hover:text-accent transition-colors truncate"
              @click="onOpen(flow.id)"
            >
              {{ flow.name }}
            </button>

            <span
              class="shrink-0 flex items-center gap-x-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border"
              :class="flow.status === 'published'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-muted bg-surface-2'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="flow.status === 'published' ? 'bg-accent' : 'bg-muted'" />
              {{ flow.status }}
            </span>
          </div>

          <!-- Meta -->
          <div class="flex items-center gap-x-3 text-[11px] font-mono text-muted">
            <span>{{ flow.nodes.length }} {{ flow.nodes.length === 1 ? 'field' : 'fields' }}</span>
            <span class="opacity-50">·</span>
            <span>Updated {{ relativeTime(flow.updatedAt) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-x-2 flex-wrap pt-2 border-t border-border">
            <button
              class="px-2.5 py-1 text-xs font-mono text-text hover:text-accent border border-border hover:border-accent rounded transition-colors"
              @click="onOpen(flow.id)"
            >
              Open
            </button>
            <button
              class="px-2.5 py-1 text-xs font-mono text-muted hover:text-accent border border-border hover:border-accent rounded transition-colors"
              @click="startRename(flow.id, flow.name)"
            >
              Rename
            </button>
            <button
              class="px-2.5 py-1 text-xs font-mono border rounded transition-colors"
              :class="flow.status === 'published'
                ? 'border-border text-muted hover:text-accent hover:border-accent'
                : 'border-accent text-accent hover:bg-accent/10'"
              @click="togglePublish(flow.id, flow.status)"
            >
              {{ flow.status === 'published' ? 'Unpublish' : 'Publish' }}
            </button>
            <button
              class="ml-auto px-2.5 py-1 text-xs font-mono text-muted hover:text-accent-3 border border-border hover:border-accent-3 rounded transition-colors"
              @click="onDelete(flow.id, flow.name)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
