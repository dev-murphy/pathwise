<script setup lang="ts">
import { ref } from "vue";
import XButton from "~/components/common/XButton.vue";
import XSelect from "~/components/common/XSelect.vue";

const selectOptions = ref(["Option 1", "Option 2", "Option 3"]);
const selectValue = ref(selectOptions.value[0]);
</script>

<template>
  <div class="h-screen bg-bg flex flex-col">
    <nav class="bg-surface border-b border-border p-4">
      <div
        class="max-w-350 flex items-center justify-between text-text mx-auto"
      >
      <div class="flex items-center gap-x-2 select-none">
        <img src="./assets/images/logo.png" alt="logo" class="w-8 aspect-square">
        <p class="text-accent text-xl font-head font-black uppercase">Pathwise</p>
      </div>

        <div class="flex gap-x-2">
          <XButton text="Reset" variants="default" />
          <XButton text="Fit View" />
        </div>
      </div>
    </nav>

    <div class="grow">
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
          <XButton text="Add Node" size="expand" />
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
    </div>
  </div>
</template>
