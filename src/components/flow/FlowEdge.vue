<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps<EdgeProps>()

const path = computed(() => getBezierPath(props))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <BaseEdge
    :path="path[0]"
    :style="{
      stroke: 'var(--color-accent)',
      strokeWidth: selected ? 2.5 : 1.5,
      opacity: selected ? 1 : 0.7,
      transition: 'stroke-width 0.15s, opacity 0.15s',
    }"
  />

  <EdgeLabelRenderer v-if="label">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border transition-colors duration-150"
      :class="selected
        ? 'bg-accent text-bg border-accent'
        : 'bg-surface border-border text-accent'"
    >
      {{ label }}
    </div>
  </EdgeLabelRenderer>
</template>
