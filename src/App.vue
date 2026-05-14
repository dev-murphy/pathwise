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
const pendingOptionId = ref<string>("");

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

// Node options for the "routes to" dropdowns — excludes the node being edited
const routeTargetOptions = computed((): SelectOption[] =>
  (nodes.value as Node[])
    .filter((n: Node) => n.id !== selectedNodeId.value)
    .map((n: Node) => ({ id: n.id, label: n.data.label as string }))
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

function onSetOptionTarget(optionId: string, targetNodeId: string) {
  const opt = fieldOptions.value.find((o) => o.id === optionId);
  if (opt) opt.targetNodeId = targetNodeId || undefined;
}

function resetFieldForm() {
  fieldLabel.value = "";
  fieldType.value = "text";
  fieldRequired.value = false;
  fieldOptions.value = [];
  newOptionText.value = "";
}

// ─── Edge sync helpers ────────────────────────────────────────────────────────

/** Remove all outgoing edges from a node */
function clearOutgoingEdges(nodeId: string) {
  const filtered: Edge[] = (edges.value as Edge[]).filter(
    (e: Edge) => e.source !== nodeId
  );
  edges.value = filtered;
}

/** Sync edges from option targetNodeIds for option-bearing fields */
function syncOptionEdges(nodeId: string, options: FieldOption[]) {
  clearOutgoingEdges(nodeId);
  options.forEach((opt) => {
    if (!opt.targetNodeId) return;
    const edgeId = `e${nodeId}->${opt.targetNodeId}`;
    edges.value.push({
      id: edgeId,
      type: "flow",
      source: nodeId,
      target: opt.targetNodeId,
      label: opt.label,
    });
  });
}

// ─── Add / Save field ─────────────────────────────────────────────────────────

function onAddOrSave() {
  if (panelMode.value === "editAnswer") {
    onSaveEdgeLabel();
    return;
  }

  const text = fieldLabel.value.trim();
  if (!text) return;

  const isOptionType = OPTIONS_TYPES.includes(fieldType.value);

  const data: QuestionNodeData = {
    label: text,
    fieldType: fieldType.value,
    options: [...fieldOptions.value],
    isStart: false,
    required: fieldRequired.value,
  };

  if (panelMode.value === "editField" && selectedNodeId.value) {
    const nodeId = selectedNodeId.value;
    const target = (nodes.value as Node[]).find((n: Node) => n.id === nodeId);
    if (target) {
      const wasStart = target.data.isStart as boolean;
      target.data = { ...data, isStart: wasStart } as Record<string, unknown>;
    }
    // Sync edges for option-bearing types
    if (isOptionType) {
      syncOptionEdges(nodeId, fieldOptions.value);
    }
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
  if (!selectedEdgeId.value) return;
  const target = (edges.value as Edge[]).find(
    (e: Edge) => e.id === selectedEdgeId.value
  );
  if (target) target.label = edgeLabelText.value.trim();
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
  pendingOptionId.value = "";

  const data = node.data as Partial<QuestionNodeData> | undefined;
  fieldLabel.value = String(data?.label ?? "");
  fieldType.value = (data?.fieldType as FieldType) ?? "text";
  fieldRequired.value = data?.required ?? false;
  fieldOptions.value = data?.options ? [...(data.options as FieldOption[])] : [];
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
  pendingOptionId.value = "";
  resetFieldForm();
}

function onPaneClick() {
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
  selectedEdgeNodeIds.value = new Set();
  edgeLabelText.value = "";
  pendingConnection.value = null;
  pendingOptionId.value = "";
  resetFieldForm();
}

// ─── Drag-to-connect ──────────────────────────────────────────────────────────

// Options of the source node when a pending connection exists
const pendingSourceOptions = computed((): FieldOption[] => {
  if (!pendingConnection.value) return [];
  const src = (nodes.value as Node[]).find(
    (n: Node) => n.id === pendingConnection.value!.source
  );
  return (src?.data.options as FieldOption[]) ?? [];
});

function onConnect(connection: Connection) {
  const sourceNode = (nodes.value as Node[]).find(
    (n: Node) => n.id === connection.source
  );
  const srcFieldType =
    (sourceNode?.data as Partial<QuestionNodeData>)?.fieldType ?? "text";
  const isMultiBranch = MULTI_BRANCH_TYPES.includes(srcFieldType);

  if (isMultiBranch) {
    pendingConnection.value = {
      source: connection.source!,
      target: connection.target!,
    };
    pendingOptionId.value = "";
    selectedNodeId.value = null;
    selectedEdgeId.value = null;
  } else {
    pushEdge(connection.source!, connection.target!, "");
  }
}

function pushEdge(source: string, target: string, label: string) {
  const edgeId = `e${source}->${target}`;
  if (edges.value.some((e) => e.id === edgeId)) return;
  edges.value.push({ id: edgeId, type: "flow", source, target, label });
}

function onConfirmConnection() {
  if (!pendingConnection.value) return;
  const { source, target } = pendingConnection.value;

  if (pendingOptionId.value) {
    // Link the chosen option's targetNodeId and sync edges
    const srcNode = (nodes.value as Node[]).find((n: Node) => n.id === source);
    if (srcNode) {
      const opts = (srcNode.data.options as FieldOption[]) ?? [];
      const opt = opts.find((o) => o.id === pendingOptionId.value);
      if (opt) opt.targetNodeId = target;
      srcNode.data = { ...srcNode.data, options: [...opts] } as Record<string, unknown>;
      syncOptionEdges(source, opts);
    }
  } else {
    pushEdge(source, target, "");
  }

  pendingConnection.value = null;
  pendingOptionId.value = "";
}

function onCancelConnection() {
  pendingConnection.value = null;
  pendingOptionId.value = "";
}

// ─── Drag-to-reorder field list ───────────────────────────────────────────────

const draggingIndex = ref<number | null>(null);

function onDragStart(index: number) {
  draggingIndex.value = index;
}

function onDragOver(index: number) {
  if (draggingIndex.value === null || draggingIndex.value === index) return;
  const reordered = [...nodes.value];
  const [moved] = reordered.splice(draggingIndex.value, 1);
  reordered.splice(index, 0, moved);
  nodes.value = reordered;
  draggingIndex.value = index;
}

function onDragEnd() {
  draggingIndex.value = null;
}

// ─── Reorganize layout (sidebar-order-aware) ──────────────────────────────────

function reorganize() {
  if (nodes.value.length === 0) return;

  const H_GAP = 280;
  const V_GAP = 180;
  const DISCONNECTED_X = 600;

  // Build outgoing edge map
  const outgoing = new Map<string, string[]>();
  nodes.value.forEach((n) => outgoing.set(n.id, []));
  (edges.value as Edge[]).forEach((e: Edge) => {
    outgoing.get(e.source)?.push(e.target);
  });

  // Walk nodes in sidebar order to assign positions
  const positions = new Map<string, { x: number; y: number }>();
  const connected = new Set<string>(
    (edges.value as Edge[]).flatMap((e: Edge) => [e.source, e.target])
  );

  let row = 0;
  let disconnectedRow = 0;

  nodes.value.forEach((n) => {
    if (!connected.has(n.id) && nodes.value.length > 1) {
      // Disconnected node — place in right column
      positions.set(n.id, { x: DISCONNECTED_X, y: disconnectedRow * V_GAP });
      disconnectedRow++;
      return;
    }

    const targets = outgoing.get(n.id) ?? [];
    if (targets.length <= 1) {
      // Single branch — centre column
      positions.set(n.id, { x: 0, y: row * V_GAP });
      row++;
    } else {
      // Multi-branch — place node in centre, fan targets horizontally below
      positions.set(n.id, { x: 0, y: row * V_GAP });
      row++;
      const totalWidth = (targets.length - 1) * H_GAP;
      targets.forEach((tid, i) => {
        if (!positions.has(tid)) {
          positions.set(tid, {
            x: i * H_GAP - totalWidth / 2,
            y: row * V_GAP,
          });
        }
      });
      // Skip the next row since targets were placed inline
      row++;
    }
  });

  // Apply positions
  nodes.value.forEach((n) => {
    const pos = positions.get(n.id);
    if (pos) n.position = { ...pos };
  });

  nextTick(() => fitView({ padding: 0.2 }));
}

// ─── Node list highlight ──────────────────────────────────────────────────────

function nodeListClass(node: { id: string; selected?: boolean }, index: number) {
  const isDirectlySelected = node.selected;
  const isEdgeConnected = selectedEdgeNodeIds.value.has(node.id);
  const isDragging = draggingIndex.value === index;

  if (isDragging) return "border-accent/60 bg-accent/5 opacity-50";
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
  pendingOptionId.value = "";
  startNodeId.value = null;
  draggingIndex.value = null;
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
        <!-- Main panel -->
        <div class="p-4 flex flex-col gap-y-2 shrink-0">
          <h1 class="uppercase tracking-widest">{{ panelTitle }}</h1>

          <!-- Pending Connection mode -->
          <template v-if="panelMode === 'pendingConnection'">
            <template v-if="pendingSourceOptions.length">
              <p>Which option leads here?</p>
              <XSelect
                id="pending-option"
                :model-value="pendingOptionId"
                :options="pendingSourceOptions.map((o) => o.id)"
                :display-options="pendingSourceOptions.map((o) => o.label)"
                has-default-value
                @update:model-value="(val) => { pendingOptionId = val }"
              />
            </template>
            <template v-else>
              <p class="text-muted italic">Add options to this field before connecting.</p>
            </template>
            <div class="flex gap-x-2">
              <XButton
                text="Save"
                size="expand"
                :variants="pendingSourceOptions.length && pendingOptionId ? 'primary' : 'default'"
                @trigger="onConfirmConnection"
              />
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

            <!-- Options editor -->
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
              <ul v-if="fieldOptions.length" class="flex flex-col gap-y-1.5">
                <li
                  v-for="opt in fieldOptions"
                  :key="opt.id"
                  class="flex flex-col gap-y-1 px-2 py-1.5 bg-surface-2 border border-border rounded"
                >
                  <div class="flex items-center justify-between gap-x-2">
                    <span class="text-text truncate grow">{{ opt.label }}</span>
                    <button
                      class="shrink-0 text-muted hover:text-accent-3 transition-colors duration-150 cursor-pointer"
                      @click="onRemoveOption(opt.id)"
                    >
                      ✕
                    </button>
                  </div>
                  <!-- Route-to picker -->
                  <XSelect
                    :id="`opt-target-${opt.id}`"
                    :model-value="opt.targetNodeId ?? ''"
                    :options="routeTargetOptions.map((o) => o.id)"
                    :display-options="routeTargetOptions.map((o) => o.label)"
                    has-default-value
                    @update:model-value="(val) => onSetOptionTarget(opt.id, val)"
                  />
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
              v-if="nodes.length > 1"
              class="text-[9px] uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer"
              @click="reorganize"
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
            @dragstart="onDragStart(index)"
            @dragover.prevent="onDragOver(index)"
            @dragend="onDragEnd"
          >
            <!-- Drag handle -->
            <span class="shrink-0 text-muted text-sm select-none">⠿</span>

            <!-- Start / F badge -->
            <span
              class="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              :class="node.data.isStart ? 'bg-accent text-bg' : 'bg-accent/10 text-accent'"
            >
              {{ node.data.isStart ? 'Start' : 'F' }}
            </span>

            <!-- Label -->
            <span class="truncate leading-relaxed grow">{{ node.data.label }}</span>

            <!-- Required asterisk -->
            <span v-if="node.data.required" class="shrink-0 text-accent-3 font-bold">*</span>

            <!-- Field type -->
            <span class="shrink-0 text-[9px] uppercase tracking-wider text-muted">
              {{ FIELD_TYPE_LABELS[node.data.fieldType as FieldType] ?? 'Text' }}
            </span>

            <!-- Set start -->
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
