<script setup lang="ts">
import type { Node, Edge, Connection } from "@vue-flow/core";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import type { NodeMouseEvent, EdgeMouseEvent } from "@vue-flow/core";

import {
  FIELD_TYPE_LABELS,
  MULTI_BRANCH_TYPES,
  OPTIONS_TYPES,
} from "~/types/flow";
import type { FieldType, FieldOption, QuestionNodeData } from "~/types/flow";

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

// ─── Selection ────────────────────────────────────────────────────────────────

const selectedNodeId = ref<string | null>(null);
const selectedEdgeId = ref<string | null>(null);
const selectedEdgeNodeIds = ref<Set<string>>(new Set());

// ─── Start node ───────────────────────────────────────────────────────────────

const startNodeId = ref<string | null>(null);
let nextId = 1;

function setStartNode(id: string) {
  nodes.value.forEach((n) => {
    n.data = { ...n.data, isStart: n.id === id };
  });
  startNodeId.value = id;
}

// ─── Panel mode ───────────────────────────────────────────────────────────────

type PanelMode = "addField" | "editField" | "editAnswer" | "pendingConnection";

const pendingConnection = ref<{ source: string; target: string } | null>(null);
const pendingEdgeLabel = ref("");

const panelMode = computed((): PanelMode => {
  if (pendingConnection.value !== null) return "pendingConnection";
  if (selectedEdgeId.value !== null) return "editAnswer";
  if (selectedNodeId.value !== null) return "editField";
  return "addField";
});

const panelTitle = computed(() => {
  switch (panelMode.value) {
    case "editAnswer": return "Edit Answer";
    case "editField": return "Edit Field";
    case "pendingConnection": return "New Connection";
    default: return "Add Field";
  }
});

const panelButtonText = computed(() => {
  if (panelMode.value === "addField") return "Add Field";
  return "Save Changes";
});

// ─── Field form state ─────────────────────────────────────────────────────────

const fieldLabel = ref("");
const fieldType = ref<FieldType>("text");
const fieldRequired = ref(false);
const fieldOptions = ref<FieldOption[]>([]);
const newOptionText = ref("");

const fieldTypeOptions = Object.entries(FIELD_TYPE_LABELS).map(([id, label]) => ({
  id,
  label,
})) as SelectOption[];

const showOptionsEditor = computed(() =>
  OPTIONS_TYPES.includes(fieldType.value)
);

function onAddOption() {
  const text = newOptionText.value.trim();
  if (!text) return;
  fieldOptions.value.push({ id: String(Date.now()), label: text });
  newOptionText.value = "";
}

function onRemoveOption(id: string) {
  fieldOptions.value = fieldOptions.value.filter((o) => o.id !== id);
}

function resetFieldForm() {
  fieldLabel.value = "";
  fieldType.value = "text";
  fieldRequired.value = false;
  fieldOptions.value = [];
  newOptionText.value = "";
}

// ─── Add / Save field ─────────────────────────────────────────────────────────

function onAddOrSave() {
  if (panelMode.value === "editAnswer") {
    onSaveEdgeLabel();
    return;
  }

  const text = fieldLabel.value.trim();
  if (!text) return;

  const data: QuestionNodeData = {
    label: text,
    fieldType: fieldType.value,
    options: [...fieldOptions.value],
    isStart: false,
    required: fieldRequired.value,
  };

  if (panelMode.value === "editField" && selectedNodeId.value) {
    const target = (nodes.value as Node[]).find(
      (n: Node) => n.id === selectedNodeId.value
    );
    if (target) target.data = { ...target.data, ...data } as Record<string, unknown>;
  } else {
    const id = String(nextId++);
    const isFirst = nodes.value.length === 0;
    nodes.value.push({
      id,
      type: "question",
      position: { x: 100 + Math.random() * 400, y: 80 + Math.random() * 300 },
      data: { ...data, isStart: isFirst },
    });
    if (isFirst) startNodeId.value = id;
    resetFieldForm();
  }
}

// ─── Edge label editing ───────────────────────────────────────────────────────

const edgeLabelText = ref("");

function onSaveEdgeLabel() {
  const text = edgeLabelText.value.trim();
  if (!selectedEdgeId.value) return;
  const target = (edges.value as Edge[]).find(
    (e: Edge) => e.id === selectedEdgeId.value
  );
  if (target) target.label = text;
}

function onDeleteEdge() {
  if (!selectedEdgeId.value) return;
  const idToRemove = selectedEdgeId.value;
  const filtered: Edge[] = (edges.value as Edge[]).filter(
    (e: Edge) => e.id !== idToRemove
  );
  edges.value = filtered;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
}

// ─── Canvas event handlers ────────────────────────────────────────────────────

function selectNode(node: { id: string; data?: Record<string, unknown> }) {
  selectedNodeId.value = node.id;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";

  const data = node.data as Partial<QuestionNodeData> | undefined;
  fieldLabel.value = String(data?.label ?? "");
  fieldType.value = (data?.fieldType as FieldType) ?? "text";
  fieldRequired.value = data?.required ?? false;
  fieldOptions.value = data?.options ? [...data.options] : [];
}

function onNodeClick({ node }: NodeMouseEvent) {
  selectNode(node);
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  selectedNodeId.value = null;
  selectedEdgeId.value = edge.id;
  selectedEdgeNodeIds.value = new Set([edge.source, edge.target]);
  edgeLabelText.value = String(edge.label ?? "");
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";
  resetFieldForm();
}

function onPaneClick() {
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";
  resetFieldForm();
}

// ─── Drag-to-connect ──────────────────────────────────────────────────────────

function onConnect(connection: Connection) {
  const sourceNode = (nodes.value as Node[]).find(
    (n: Node) => n.id === connection.source
  );
  const srcFieldType = (sourceNode?.data as Partial<QuestionNodeData>)?.fieldType ?? "text";
  const isMultiBranch = MULTI_BRANCH_TYPES.includes(srcFieldType);

  if (isMultiBranch) {
    pendingConnection.value = {
      source: connection.source!,
      target: connection.target!,
    };
    pendingEdgeLabel.value = "";
    selectedNodeId.value = null;
    selectedEdgeId.value = null;
  } else {
    pushEdge(connection.source!, connection.target!, "");
  }
}

function pushEdge(source: string, target: string, label: string) {
  const edgeId = `e${source}->${target}`;
  if (edges.value.some((e) => e.id === edgeId)) return;
  edges.value.push({
    id: edgeId,
    type: "flow",
    source,
    target,
    label,
  });
}

function onConfirmConnection() {
  if (!pendingConnection.value) return;
  pushEdge(
    pendingConnection.value.source,
    pendingConnection.value.target,
    pendingEdgeLabel.value.trim()
  );
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";
}

function onCancelConnection() {
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";
}

// ─── Reorganize layout ────────────────────────────────────────────────────────

function reorganize() {
  if (!startNodeId.value || nodes.value.length === 0) return;

  const H_GAP = 280;
  const V_GAP = 180;

  const children = new Map<string, string[]>();
  nodes.value.forEach((n) => children.set(n.id, []));
  (edges.value as Edge[]).forEach((e: Edge) => {
    children.get(e.source)?.push(e.target);
  });

  const layer = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [startNodeId.value];
  layer.set(startNodeId.value, 0);
  visited.add(startNodeId.value);

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLayer = layer.get(nodeId)!;
    for (const child of children.get(nodeId) ?? []) {
      if (!visited.has(child)) {
        visited.add(child);
        layer.set(child, currentLayer + 1);
        queue.push(child);
      }
    }
  }

  const byLayer = new Map<number, string[]>();
  layer.forEach((l, id) => {
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(id);
  });

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

  const maxLayer = byLayer.size > 0 ? Math.max(...byLayer.keys()) : 0;
  const unreachable = (nodes.value as Node[]).filter(
    (n: Node) => !visited.has(n.id)
  );
  unreachable.forEach((n, i) => {
    positions.set(n.id, {
      x: i * H_GAP - ((unreachable.length - 1) * H_GAP) / 2,
      y: (maxLayer + 2) * V_GAP,
    });
  });

  nodes.value.forEach((n) => {
    const pos = positions.get(n.id);
    if (pos) n.position = { ...pos };
  });

  nextTick(() => fitView({ padding: 0.2 }));
}

// ─── Node list highlight ──────────────────────────────────────────────────────

function nodeListClass(node: { id: string; selected?: boolean }) {
  const isDirectlySelected = node.selected;
  const isEdgeConnected = selectedEdgeNodeIds.value.has(node.id);

  if (isDirectlySelected) return "border-accent bg-accent/5 text-accent";
  if (isEdgeConnected) return "border-accent/40 bg-accent/5";
  return "border-border bg-surface-2";
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function onReset() {
  nodes.value = [];
  edges.value = [];
  nextId = 1;
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
  pendingConnection.value = null;
  pendingEdgeLabel.value = "";
  startNodeId.value = null;
  resetFieldForm();
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
        <!-- Main panel: Add Field / Edit Field / Edit Answer / Pending Connection -->
        <div class="p-4 flex flex-col gap-y-2 shrink-0">
          <h1 class="uppercase tracking-widest">{{ panelTitle }}</h1>

          <!-- Pending Connection mode -->
          <template v-if="panelMode === 'pendingConnection'">
            <p>Label this path</p>
            <input
              v-model="pendingEdgeLabel"
              placeholder="e.g. Yes, No, Option A..."
              class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200"
              autofocus
            />
            <div class="flex gap-x-2">
              <XButton text="Save" size="expand" variants="primary" @trigger="onConfirmConnection" />
              <XButton text="Cancel" size="expand" variants="default" @trigger="onCancelConnection" />
            </div>
          </template>

          <!-- Edit Answer mode -->
          <template v-else-if="panelMode === 'editAnswer'">
            <p>Answer label</p>
            <input
              v-model="edgeLabelText"
              placeholder="Enter answer label..."
              class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200"
            />
            <XButton
              text="Save Changes"
              size="expand"
              :variants="edgeLabelText.trim() ? 'primary' : 'default'"
              @trigger="onSaveEdgeLabel"
            />
            <XButton
              text="Delete Connection"
              size="expand"
              variants="default"
              @trigger="onDeleteEdge"
            />
          </template>

          <!-- Add / Edit Field mode -->
          <template v-else>
            <p>Field label</p>
            <textarea
              v-model="fieldLabel"
              placeholder="Enter field label..."
              class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none p-2 text-text text-sm rounded resize-none transition-colors duration-200"
              rows="2"
            />

            <p>Type</p>
            <XSelect
              id="field-type"
              :model-value="fieldType"
              :options="fieldTypeOptions.map((o) => o.id)"
              :display-options="fieldTypeOptions.map((o) => o.label)"
              @update:model-value="(val) => { fieldType = val as FieldType }"
            />

            <!-- Options editor: shown for dropdown / radio / multiselect -->
            <template v-if="showOptionsEditor">
              <p class="mt-1">Options</p>
              <div class="flex gap-x-2">
                <input
                  v-model="newOptionText"
                  placeholder="Add option..."
                  class="grow bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200"
                  @keydown.enter.prevent="onAddOption"
                />
                <XButton text="Add" variants="default" @trigger="onAddOption" />
              </div>
              <ul v-if="fieldOptions.length" class="flex flex-col gap-y-1">
                <li
                  v-for="opt in fieldOptions"
                  :key="opt.id"
                  class="flex items-center justify-between gap-x-2 px-2 py-1 bg-surface-2 border border-border rounded"
                >
                  <span class="text-text truncate">{{ opt.label }}</span>
                  <button
                    class="shrink-0 text-muted hover:text-accent-3 transition-colors duration-150 cursor-pointer"
                    @click="onRemoveOption(opt.id)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
            </template>

            <!-- Required toggle -->
            <label class="flex items-center gap-x-2 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="fieldRequired"
                class="accent-accent w-3.5 h-3.5 cursor-pointer"
              />
              <span>Required</span>
            </label>

            <XButton
              :text="panelButtonText"
              size="expand"
              :variants="fieldLabel.trim() ? 'primary' : 'default'"
              @trigger="onAddOrSave"
            />
          </template>
        </div>

        <!-- Field list -->
        <div v-if="nodes.length" class="p-4 flex flex-col gap-y-2 min-h-0 overflow-y-auto">
          <div class="flex items-center justify-between shrink-0">
            <h2 class="uppercase tracking-widest">Fields ({{ nodes.length }})</h2>
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
              :class="node.data.isStart ? 'bg-accent text-bg' : 'bg-accent/10 text-accent'"
            >
              {{ node.data.isStart ? 'Start' : 'F' }}
            </span>
            <span class="truncate leading-relaxed grow">{{ node.data.label }}</span>
            <span class="shrink-0 text-[9px] uppercase tracking-wider text-muted">
              {{ FIELD_TYPE_LABELS[node.data.fieldType as FieldType] ?? 'Text' }}
            </span>
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
            @connect="onConnect"
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
