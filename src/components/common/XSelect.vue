<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    id: string;
    modelValue: string;
    options: string[];
    /** Optional human-readable labels for each option (same order as `options`). Falls back to `options` if omitted. */
    displayOptions?: string[];
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

/** Returns the display label for the currently selected value */
const selectedLabel = computed(() => {
  if (!props.modelValue) return "-- Select Option --";
  const idx = props.options.indexOf(props.modelValue);
  if (idx === -1) return props.modelValue;
  return props.displayOptions?.[idx] ?? props.options[idx];
});

function displayFor(index: number): string {
  return props.displayOptions?.[index] ?? props.options[index];
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="group w-full bg-surface-2 flex items-center justify-between p-2 border border-border hover:border-accent text-text hover:text-accent transition-colors duration-300 rounded-lg"
      @click="toggleDropdown"
    >
      <span class="truncate text-left">{{ selectedLabel }}</span>
      <ChevronDown
        class="w-5 h-5 ml-auto shrink-0 text-muted group-hover:text-accent transition-colors duration-300"
        :class="{ 'rotate-180': isDropdownOpen }"
      />
    </button>

    <Transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="absolute top-full inset-x-0 translate-y-2 flex flex-col bg-surface-2 p-1 border border-border space-y-1.5 rounded-lg z-10 max-h-48 overflow-y-auto"
      >
        <button
          v-if="hasDefaultValue"
          class="px-2 py-1 text-left rounded cursor-pointer"
          :class="{
            'bg-accent text-bg font-bold': '' === modelValue,
            'hover:bg-accent/10 hover:text-accent': '' !== modelValue,
          }"
          @click="$emit('update:modelValue', ''); isDropdownOpen = false"
        >
          -- Select Option --
        </button>
        <button
          v-for="(option, index) in options"
          :key="`option-${id}-${index}`"
          class="px-2 py-1 text-left rounded cursor-pointer truncate"
          :class="{
            'bg-accent text-bg font-bold': option === modelValue,
            'hover:bg-accent/10 hover:text-accent': option !== modelValue,
          }"
          @click="$emit('update:modelValue', option); isDropdownOpen = false"
        >
          {{ displayFor(index) }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
