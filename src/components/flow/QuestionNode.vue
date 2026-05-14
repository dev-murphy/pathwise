<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import { FIELD_TYPE_LABELS } from '~/types/flow'
import type { FieldType } from '~/types/flow'

const props = defineProps<NodeProps>()

const typeLabel = computed(() =>
  FIELD_TYPE_LABELS[(props.data.fieldType as FieldType) ?? 'text']
)
</script>

<template>
  <div
    class="question-node min-w-52 max-w-72 rounded-lg p-3 shadow-lg transition-all duration-150"
    :class="selected
      ? 'bg-surface-2 border-[3px] border-accent shadow-[0_0_0_1px_var(--color-accent)]'
      : 'bg-surface border-2 border-accent/60'"
  >
    <div class="flex items-center gap-x-1.5 mb-2">
      <span
        v-if="data.isStart"
        class="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent text-bg"
      >
        Start
      </span>
      <span
        v-else
        class="text-[9px] font-mono font-bold uppercase tracking-widest text-accent/70"
      >
        Field
      </span>
      <span class="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border">
        {{ typeLabel }}
      </span>
    </div>
    <p class="text-text text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
      {{ data.label }}<span v-if="data.required" class="text-accent-3 font-bold ml-0.5">*</span>
    </p>
    <Handle type="target" :position="Position.Top" class="!bg-accent/50 !border-accent" />
    <Handle type="source" :position="Position.Bottom" class="!bg-accent !border-accent" />
  </div>
</template>
