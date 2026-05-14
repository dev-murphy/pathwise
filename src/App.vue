<script setup lang="ts">
import type { Node, Edge } from "@vue-flow/core";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";

import "@vue-flow/controls/dist/style.css";

const selectOptions = ref(["Option 1", "Option 2", "Option 3"]);
const selectValue = ref(selectOptions.value[0]);

// these are our nodes
const nodes = ref<Node[]>([
  // an input node, specified by using `type: 'input'`
  {
    id: "1",
    type: "input",
    position: { x: 250, y: 5 },
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: { label: "Node 1" },
  },

  // default node, you can omit `type: 'default'` as it's the fallback type
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: { label: "Node 2" },
  },

  // An output node, specified by using `type: 'output'`
  {
    id: "3",
    type: "output",
    position: { x: 400, y: 200 },
    data: { label: "Node 3" },
  },

  // this is a custom node
  // we set it by using a custom type name we choose, in this example `special`
  // the name can be freely chosen, there are no restrictions as long as it's a string
  {
    id: "4",
    type: "special", // <-- this is the custom node type name
    position: { x: 400, y: 200 },
    data: {
      label: "Node 4",
      hello: "world",
    },
  },
]);

// these are our edges
const edges = ref<Edge[]>([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: "e1->2",
    source: "1",
    target: "2",
  },

  // set `animated: true` to create an animated edge path
  {
    id: "e2->3",
    source: "2",
    target: "3",
    animated: true,
  },

  // a custom edge, specified by using a custom type name
  // we choose `type: 'special'` for this example
  {
    id: "e3->4",
    type: "default",
    source: "3",
    target: "4",
    label: "world",

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: "world",
    },
  },
]);

const { addNodes } = useVueFlow();

function generateRandomNode() {
  const id = Math.floor((Math.random() * 100) + 5).toString();
  return {
    id,
    position: { x: Math.random() * 500, y: Math.random() * 500 },
    label: "Random Node " + id,
    type: "input",
    data: {
      hello: "world",
    },
  };
}

function onAddNode() {
  addNodes(generateRandomNode());
}
</script>

<template>
  <div class="h-screen bg-bg flex flex-col">
    <nav class="bg-surface border-b border-border p-4">
      <div
        class="max-w-350 flex items-center justify-between text-text mx-auto"
      >
        <div class="flex items-center gap-x-2 select-none">
          <img
            src="./assets/images/logo.png"
            alt="logo"
            class="w-8 aspect-square"
          />
          <p class="text-accent text-xl font-head font-black uppercase">
            Pathwise
          </p>
        </div>

        <div class="flex gap-x-2">
          <XButton text="Reset" variants="default" />
          <XButton text="Fit View" />
        </div>
      </div>
    </nav>

    <div class="grow flex">
      <aside
        class="w-75 h-full bg-surface border-r border-border flex flex-col divide-y divide-border text-xs text-muted font-mono"
      >
        <!-- Add Node -->
        <div class="p-4">
          <h1 class="mb-3 uppercase tracking-widest">Add Node</h1>
          <p>Type</p>
          <div class="my-2 flex gap-x-2">
            <XButton text="Question" variants="default" size="expand" />
            <XButton text="Answer" variants="default" size="expand" />
          </div>
          <textarea
            placeholder="Add Question here..."
            class="w-full bg-surface-2 border border-border p-2 mb-2 text-sm rounded"
          />
          <XButton text="Add Node" size="expand" @trigger="onAddNode" />
        </div>

        <!-- Connect Nodes  -->
        <div class="p-4">
          <h2 class="mb-2 uppercase tracking-widest">Connect Nodes</h2>
          <p class="pb-1">From (question)</p>
          <XSelect
            id="connect"
            :model-value="selectValue"
            :options="selectOptions"
            @update:model-value="
              (val) => {
                selectValue = val;
              }
            "
          />
          <p class="mt-3 mb-1">To (any node)</p>
          <XSelect
            id="connect"
            :model-value="selectValue"
            :options="selectOptions"
            @update:model-value="
              (val) => {
                selectValue = val;
              }
            "
          />

          <p class="mt-3 mb-1">Edge label</p>
          <div class="flex gap-x-2 mb-2">
            <XButton text="Yes" variants="default" size="expand" />
            <XButton text="No" variants="default" size="expand" />
            <XButton text="Custom" variants="default" size="expand" />
          </div>

          <XButton text="Connect" size="expand" />
        </div>
      </aside>

      <main class="w-full h-full relative">
        <div class="absolute w-full h-full top-0">
          <VueFlow :nodes="nodes" :edges="edges">
            <Background variant="dots" />
            <Controls />

            <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
            <template #node-special="specialNodeProps">
              <SpecialNode v-bind="specialNodeProps" />
            </template>

            <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
            <template #edge-special="specialEdgeProps">
              <SpecialEdge v-bind="specialEdgeProps" />
            </template>
          </VueFlow>
        </div>
      </main>
    </div>
  </div>
</template>
