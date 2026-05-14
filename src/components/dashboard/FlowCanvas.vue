<script setup lang="ts">
import type { Node, Edge, Connection } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import '@vue-flow/controls/dist/style.css'

defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  (e: 'update:nodes', v: Node[]): void
  (e: 'update:edges', v: Edge[]): void
  (e: 'nodeClick', payload: NodeMouseEvent): void
  (e: 'edgeClick', payload: EdgeMouseEvent): void
  (e: 'paneClick'): void
  (e: 'connect', connection: Connection): void
}>()
</script>

<template>
  <div class="absolute inset-0">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @update:nodes="emit('update:nodes', $event)"
      @update:edges="emit('update:edges', $event)"
      @node-click="emit('nodeClick', $event)"
      @edge-click="emit('edgeClick', $event)"
      @pane-click="emit('paneClick')"
      @connect="emit('connect', $event)"
    >
      <Background variant="dots" />
      <Controls />

      <template #node-question="nodeProps">
        <QuestionNode v-bind="nodeProps" />
      </template>

      <template #edge-flow="edgeProps">
        <FlowEdge v-bind="edgeProps" />
      </template>
    </VueFlow>
  </div>
</template>
