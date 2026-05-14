<script lang="ts" setup>
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string;
    modelValue: string;
    options: string[];
    /** Optional human-readable labels for each option (same order as `options`). Falls back to `options` if omitted. */
    displayOptions?: string[];
    /** Optional Vue icon components for each option (same order as `options`). */
    iconOptions?: Component[];
    hasDefaultValue?: boolean;
  }>(),
  {
    hasDefaultValue: false,
  },
);
defineEmits<{ (e: "update:modelValue", value: string): void }>();

const dropdownRef = useTemplateRef("dropdownRef");
const isDropdownOpen = ref(false);
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

onClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false;
});

const selectedIndex = computed(() => props.options.indexOf(props.modelValue));

/** Returns the display label for the currently selected value */
const selectedLabel = computed(() => {
  if (!props.modelValue) return "-- Select Option --";
  const idx = selectedIndex.value;
  if (idx === -1) return props.modelValue;
  return props.displayOptions?.[idx] ?? props.options[idx];
});

const selectedIcon = computed((): Component | null => {
  const idx = selectedIndex.value;
  return idx !== -1 ? (props.iconOptions?.[idx] ?? null) : null;
});

function displayFor(index: number): string {
  return props.displayOptions?.[index] ?? props.options[index];
}

function iconFor(index: number): Component | null {
  return props.iconOptions?.[index] ?? null;
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="group w-full bg-surface-2 flex items-center gap-x-2 justify-between p-2 border border-border hover:border-accent text-text hover:text-accent transition-colors duration-300 rounded-lg"
      @click="toggleDropdown"
    >
      <div class="flex items-center gap-x-2 min-w-0">
        <component
          v-if="selectedIcon && modelValue"
          :is="selectedIcon"
          class="w-4 h-4 shrink-0 text-muted group-hover:text-accent transition-colors duration-300"
        />
        <span class="truncate text-left text-sm">{{ selectedLabel }}</span>
      </div>
      <ChevronDown
        class="w-4 h-4 ml-auto shrink-0 text-muted group-hover:text-accent transition-colors duration-300"
        :class="{ 'rotate-180': isDropdownOpen }"
      />
    </button>

    <Transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="absolute top-full inset-x-0 translate-y-2 flex flex-col bg-surface-2 p-1 border border-border space-y-0.5 rounded-lg z-10 max-h-48 overflow-y-auto shadow-lg"
      >
        <button
          v-if="hasDefaultValue"
          class="px-2 py-1.5 text-left rounded cursor-pointer text-sm"
          :class="{
            'bg-accent text-muted font-bold': '' === modelValue,
            'hover:bg-accent/10 hover:text-accent text-muted': '' !== modelValue,
          }"
          @click="$emit('update:modelValue', ''); isDropdownOpen = false"
        >
          -- Select Option --
        </button>
        <button
          v-for="(option, index) in options"
          :key="`option-${id}-${index}`"
          class="flex items-center gap-x-2 px-2 py-1.5 text-left rounded cursor-pointer text-sm"
          :class="{
            'bg-accent text-bg font-bold': option === modelValue,
            'text-muted hover:bg-accent/10 hover:text-accent': option !== modelValue,
          }"
          @click="$emit('update:modelValue', option); isDropdownOpen = false"
        >
          <component
            v-if="iconFor(index)"
            :is="iconFor(index)"
            class="w-4 h-4 shrink-0"
          />
          <span class="truncate">{{ displayFor(index) }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
