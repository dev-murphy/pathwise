<script setup lang="ts">
import type { Node, Edge } from "@vue-flow/core";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import type { NodeMouseEvent, EdgeMouseEvent } from "@vue-flow/core";

import "@vue-flow/controls/dist/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectOption {
  id: string;
  label: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

const { fitView } = useVueFlow();

// ─── Selection state ──────────────────────────────────────────────────────────

const selectedNodeId = ref<string | null>(null);
const selectedEdgeId = ref<string | null>(null);
const selectedEdgeNodeIds = ref<Set<string>>(new Set());

// ─── Start node ───────────────────────────────────────────────────────────────

const startNodeId = ref<string | null>(null);

function setStartNode(id: string) {
  nodes.value.forEach((n) => {
    n.data = { ...n.data, isStart: n.id === id };
  });
  startNodeId.value = id;
}

// ─── Add / Edit Question form ─────────────────────────────────────────────────

const nodeText = ref("");
let nextId = 1;

const isEditingNode = computed(() => selectedNodeId.value !== null);
const isEditingEdge = computed(() => selectedEdgeId.value !== null);

// Which mode the top panel is in
type PanelMode = "addQuestion" | "editQuestion" | "editAnswer";
const panelMode = computed((): PanelMode => {
  if (isEditingEdge.value) return "editAnswer";
  if (isEditingNode.value) return "editQuestion";
  return "addQuestion";
});

const panelTitle = computed(() => {
  if (panelMode.value === "editAnswer") return "Edit Answer";
  if (panelMode.value === "editQuestion") return "Edit Question";
  return "Add Question";
});

const panelButtonText = computed(() => {
  if (panelMode.value === "addQuestion") return "Add Question";
  return "Save Changes";
});

// ─── Edge label editing ───────────────────────────────────────────────────────

const edgeLabelText = ref("");

function onSaveEdgeLabel() {
  const text = edgeLabelText.value.trim();
  if (!text || !selectedEdgeId.value) return;
  const target = (edges.value as Edge[]).find((e: Edge) => e.id === selectedEdgeId.value);
  if (target) target.label = text;
}

// ─── Add / Save question ──────────────────────────────────────────────────────

function onAddOrSave() {
  if (panelMode.value === "editAnswer") {
    onSaveEdgeLabel();
    return;
  }

  const text = nodeText.value.trim();
  if (!text) return;

  if (isEditingNode.value) {
    const target = (nodes.value as Node[]).find((n: Node) => n.id === selectedNodeId.value);
    if (target) target.data = { ...target.data, label: text } as Record<string, unknown>;
  } else {
    const id = String(nextId++);
    const isFirst = nodes.value.length === 0;
    nodes.value.push({
      id,
      type: "question",
      position: { x: 100 + Math.random() * 400, y: 80 + Math.random() * 300 },
      data: { label: text, isStart: isFirst },
    });
    if (isFirst) startNodeId.value = id;
    nodeText.value = "";
  }
}

// ─── Canvas event handlers ────────────────────────────────────────────────────

function selectNode(node: { id: string; data?: Record<string, unknown> }) {
  selectedNodeId.value = node.id;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
  nodeText.value = String(node.data?.label ?? "");
}

function onNodeClick({ node }: NodeMouseEvent) {
  selectNode(node);
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  selectedNodeId.value = null;
  selectedEdgeId.value = edge.id;
  selectedEdgeNodeIds.value = new Set([edge.source, edge.target]);
  nodeText.value = "";
  edgeLabelText.value = String(edge.label ?? "");
}

function onPaneClick() {
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  nodeText.value = "";
  edgeLabelText.value = "";
}

// ─── Connect panel ────────────────────────────────────────────────────────────

const nodeOptions = computed((): SelectOption[] =>
  nodes.value.map((n) => ({
    id: n.id,
    label: n.data.label as string,
  }))
);

const fromNodeId = ref("");
const toNodeId = ref("");
const answerText = ref("");

const toNodeOptions = computed((): SelectOption[] => {
  if (!fromNodeId.value) return nodeOptions.value;
  const alreadyConnected = new Set(
    (edges.value as Edge[])
      .filter((e: Edge) => e.source === fromNodeId.value)
      .map((e: Edge) => e.target)
  );
  return nodeOptions.value.filter(
    (o) => o.id !== fromNodeId.value && !alreadyConnected.has(o.id)
  );
});

watch(fromNodeId, () => {
  const valid = toNodeOptions.value.some((o) => o.id === toNodeId.value);
  if (!valid) toNodeId.value = "";
});

function onConnect() {
  if (!fromNodeId.value || !toNodeId.value) return;
  if (!answerText.value.trim()) return;

  const edgeId = `e${fromNodeId.value}->${toNodeId.value}`;
  if (edges.value.some((e) => e.id === edgeId)) return;

  edges.value.push({
    id: edgeId,
    type: "flow",
    source: fromNodeId.value,
    target: toNodeId.value,
    label: answerText.value.trim(),
  });

  answerText.value = "";
}

// ─── Reorganize layout ────────────────────────────────────────────────────────

function reorganize() {
  if (!startNodeId.value || nodes.value.length === 0) return;

  const H_GAP = 260;
  const V_GAP = 180;

  // Build adjacency map
  const children = new Map<string, string[]>();
  nodes.value.forEach((n) => children.set(n.id, []));
  (edges.value as Edge[]).forEach((e: Edge) => {
    children.get(e.source)?.push(e.target);
  });

  // BFS to assign layers and track visited
  const layer = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [startNodeId.value];
  layer.set(startNodeId.value, 0);
  visited.add(startNodeId.value);

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLayer = layer.get(nodeId)!;
    for (const child of (children.get(nodeId) ?? [])) {
      if (!visited.has(child)) {
        visited.add(child);
        layer.set(child, currentLayer + 1);
        queue.push(child);
      }
    }
  }

  // Group nodes by layer
  const byLayer = new Map<number, string[]>();
  layer.forEach((l, id) => {
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(id);
  });

  // Assign positions for reachable nodes
  const positions = new Map<string, { x: number; y: number }>();
  byLayer.forEach((ids, l) => {
    const totalWidth = (ids.length - 1) * H_GAP;
    ids.forEach((id, col) => {
      positions.set(id, {
        x: col * H_GAP - totalWidth / 2,
        y: l * V_GAP,
      });
    });
  });

  // Place unreachable nodes below the tree
  const maxLayer = byLayer.size > 0 ? Math.max(...byLayer.keys()) : 0;
  const unreachable = (nodes.value as Node[]).filter((n: Node) => !visited.has(n.id));
  unreachable.forEach((n, i) => {
    positions.set(n.id, {
      x: i * H_GAP - ((unreachable.length - 1) * H_GAP) / 2,
      y: (maxLayer + 2) * V_GAP,
    });
  });

  // Apply positions
  nodes.value.forEach((n) => {
    const pos = positions.get(n.id);
    if (pos) n.position = { ...pos };
  });

  nextTick(() => fitView({ padding: 0.2 }));
}

// ─── Node list highlight helper ───────────────────────────────────────────────

function nodeListClass(node: { id: string; selected?: boolean }) {
  const isDirectlySelected = node.selected;
  const isEdgeConnected = selectedEdgeNodeIds.value.has(node.id);

  if (isDirectlySelected) return "border-accent bg-accent/5 text-accent";
  if (isEdgeConnected) return "border-accent/40 bg-accent/5";
  return "border-border bg-surface-2";
}

// ─── Navbar actions ───────────────────────────────────────────────────────────

function onReset() {
  nodes.value = [];
  edges.value = [];
  nextId = 1;
  fromNodeId.value = "";
  toNodeId.value = "";
  nodeText.value = "";
  answerText.value = "";
  edgeLabelText.value = "";
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  startNodeId.value = null;
}

function onFitView() {
  fitView({ padding: 0.2 });
}
</script>

<template>
  <div class="h-screen bg-bg flex flex-col">
    <!-- Navbar -->
    <nav class="bg-surface border-b border-border p-4">
      <div class="max-w-350 flex items-center justify-between text-text mx-auto">
        <div class="flex items-center gap-x-2 select-none">
          <img src="./assets/images/logo.png" alt="logo" class="w-8 aspect-square" />
          <p class="text-accent text-xl font-head font-black uppercase">Pathwise</p>
        </div>
        <div class="flex gap-x-2">
          <XButton text="Reset" variants="default" @trigger="onReset" />
          <XButton text="Fit View" @trigger="onFitView" />
        </div>
      </div>
    </nav>

    <div class="grow flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="w-75 h-full bg-surface border-r border-border flex flex-col divide-y divide-border text-xs text-muted font-mono shrink-0"
      >
        <!-- Add / Edit Question / Edit Answer -->
        <div class="p-4 flex flex-col gap-y-2 shrink-0">
          <h1 class="uppercase tracking-widest">{{ panelTitle }}</h1>

          <!-- Edit Answer mode -->
          <template v-if="panelMode === 'editAnswer'">
            <p>Answer text</p>
            <input
              v-model="edgeLabelText"
              placeholder="Enter answer text..."
              class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200"
            />
          </template>

          <!-- Add / Edit Question mode -->
          <template v-else>
            <p>Question text</p>
            <textarea
              v-model="nodeText"
              placeholder="Enter your question..."
              class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none p-2 text-text text-sm rounded resize-none transition-colors duration-200"
              rows="3"
            />
          </template>

          <XButton
            :text="panelButtonText"
            size="expand"
            :variants="(panelMode === 'editAnswer' ? edgeLabelText.trim() : nodeText.trim()) ? 'primary' : 'default'"
            @trigger="onAddOrSave"
          />
        </div>

        <!-- Connect -->
        <div class="p-4 flex flex-col gap-y-2 shrink-0">
          <h2 class="uppercase tracking-widest">Connect</h2>

          <p>From</p>
          <XSelect
            id="from-node"
            :model-value="fromNodeId"
            :options="nodeOptions.map((o) => o.id)"
            :display-options="nodeOptions.map((o) => o.label)"
            has-default-value
            @update:model-value="(val) => { fromNodeId = val }"
          />

          <p class="mt-1">To</p>
          <XSelect
            id="to-node"
            :model-value="toNodeId"
            :options="toNodeOptions.map((o) => o.id)"
            :display-options="toNodeOptions.map((o) => o.label)"
            has-default-value
            @update:model-value="(val) => { toNodeId = val }"
          />

          <p class="mt-1">Answer text</p>
          <input
            v-model="answerText"
            placeholder="Enter answer text..."
            class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200"
          />

          <XButton
            text="Connect"
            size="expand"
            :variants="fromNodeId && toNodeId && answerText.trim() ? 'primary' : 'default'"
            @trigger="onConnect"
          />
        </div>

        <!-- Node list -->
        <div v-if="nodes.length" class="p-4 flex flex-col gap-y-2 min-h-0 overflow-y-auto">
          <div class="flex items-center justify-between shrink-0">
            <h2 class="uppercase tracking-widest">Questions ({{ nodes.length }})</h2>
            <button
              v-if="nodes.length > 1 && startNodeId"
              class="text-[9px] uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer"
              @click="reorganize"
            >
              Reorganize
            </button>
          </div>
          <div
            v-for="node in nodes"
            :key="node.id"
            class="flex items-center gap-x-2 p-2 border rounded transition-colors duration-150 shrink-0"
            :class="nodeListClass(node)"
          >
            <span
              class="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              :class="node.data.isStart
                ? 'bg-accent text-bg'
                : 'bg-accent/10 text-accent'"
            >
              {{ node.data.isStart ? 'Start' : 'Q' }}
            </span>
            <span class="truncate leading-relaxed grow">{{ node.data.label }}</span>
            <button
              v-if="node.id !== startNodeId"
              class="shrink-0 text-[9px] uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer"
              @click.stop="setStartNode(node.id)"
            >
              Set start
            </button>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <main class="w-full h-full relative">
        <div class="absolute inset-0">
          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            @node-click="onNodeClick"
            @edge-click="onEdgeClick"
            @pane-click="onPaneClick"
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
      </main>
    </div>
  </div>
</template>
