<script lang="ts" setup>
withDefaults(
  defineProps<{
    id: string;
    modelValue: string;
    options: string[];
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
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="group w-full bg-surface-2 flex items-center justify-between p-2 border border-border hover:border-accent text-text hover:text-accent transition-colors duration-300 rounded-lg"
      @click="toggleDropdown"
    >
      {{ modelValue }}
      <ChevronDown
        class="w-5 h-5 ml-auto text-muted group-hover:text-accent transition-colors duration-300"
        :class="{
          'rotate-180': isDropdownOpen,
        }"
      />
    </button>

    <Transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="absolute top-full inset-x-0 translate-y-2 flex flex-col bg-surface-2 p-1 border border-border space-y-1.5 rounded-lg z-10"
      >
        <button
          v-if="hasDefaultValue"
          class="px-2 py-1 text-left rounded cursor-pointer"
          :class="{
            'bg-accent text-bg font-bold': '' === modelValue,
            'hover:bg-accent/10 hover:text-accent': '' !== modelValue,
          }"
          @click="$emit('update:modelValue', '')"
        >
          -- Select Option --
        </button>
        <button
          v-for="(option, index) in options"
          :key="`option-${id}-${index}`"
          class="px-2 py-1 text-left rounded cursor-pointer"
          :class="{
            'bg-accent text-bg font-bold': option === modelValue,
            'hover:bg-accent/10 hover:text-accent': option !== modelValue,
          }"
          @click="$emit('update:modelValue', option)"
        >
          {{ option }}
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
