<script setup lang="ts">
import type { Node } from '@vue-flow/core'
import { FIELD_TYPE_LABELS } from '~/types/flow'
import type { FieldType } from '~/types/flow'

const props = defineProps<{
  nodes: Node[]
  startNodeId: string | null
  selectedEdgeNodeIds: Set<string>
  draggingIndex: number | null
}>()

const emit = defineEmits<{
  (e: 'setStart', id: string): void
  (e: 'dragStart', index: number): void
  (e: 'dragOver', index: number): void
  (e: 'dragEnd'): void
  (e: 'reorganize'): void
}>()

function nodeListClass(node: { id: string; selected?: boolean }, index: number) {
  const isDirectlySelected = node.selected
  const isEdgeConnected = props.selectedEdgeNodeIds.has(node.id)
  const isDragging = props.draggingIndex === index

  if (isDragging) return 'border-accent/60 bg-accent/5 opacity-50'
  if (isDirectlySelected) return 'border-accent bg-accent/5 text-accent'
  if (isEdgeConnected) return 'border-accent/40 bg-accent/5'
  return 'border-border bg-surface-2'
}
</script>

<template>
  <div class="p-4 flex flex-col gap-y-2 min-h-0 overflow-y-auto">
    <div class="flex items-center justify-between shrink-0">
      <h2 class="text-xs text-muted font-mono uppercase tracking-widest">
        Fields ({{ nodes.length }})
      </h2>
      <button
        v-if="nodes.length > 1"
        class="text-[9px] uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer font-mono"
        @click="emit('reorganize')"
      >
        Reorganize
      </button>
    </div>

    <div
      v-for="(node, index) in nodes"
      :key="node.id"
      class="flex items-center gap-x-2 p-2 border rounded transition-colors duration-150 shrink-0 cursor-grab active:cursor-grabbing"
      :class="nodeListClass(node, index)"
      draggable="true"
      @dragstart="emit('dragStart', index)"
      @dragover.prevent="emit('dragOver', index)"
      @dragend="emit('dragEnd')"
    >
      <!-- Drag handle -->
      <DragHandle class="w-4 h-4 shrink-0 text-muted select-none" />

      <!-- Start / F badge -->
      <span
        class="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
        :class="node.data.isStart ? 'bg-accent text-bg' : 'bg-accent/10 text-accent'"
      >
        {{ node.data.isStart ? 'Start' : 'F' }}
      </span>

      <!-- Label -->
      <span class="truncate leading-relaxed grow text-text text-xs font-mono">{{ node.data.label }}</span>

      <!-- Required asterisk -->
      <span v-if="node.data.required" class="shrink-0 text-accent-3 font-bold text-xs">*</span>

      <!-- Field type -->
      <span class="shrink-0 text-[9px] uppercase tracking-wider text-muted font-mono">
        {{ FIELD_TYPE_LABELS[node.data.fieldType as FieldType] ?? 'Text' }}
      </span>

      <!-- Set start -->
      <button
        v-if="node.id !== startNodeId"
        class="shrink-0 text-[9px] uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer font-mono"
        @click.stop="emit('setStart', node.id)"
      >
        Set start
      </button>
    </div>
  </div>
</template>
