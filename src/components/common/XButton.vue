<script lang="ts" setup>
withDefaults(
  defineProps<{
    text: string;
    size?: "compact" | "expand";
    variants?: "primary" | "default";
  }>(),
  {
    variants: "primary",
    size: "compact",
  },
);

defineEmits<{ (e: "trigger"): void }>();
</script>

<template>
  <button
    class="py-1.5 text-sm font-mono rounded-md cursor-pointer"
    :class="{
      'bg-accent text-bg hover:brightness-90': variants === 'primary',
      'bg-surface-2 border border-border text-text hover:border-accent hover:text-accent transition-colors duration-300':
        variants === 'default',
      'px-5 ': size === 'compact',
      'w-full': size === 'expand',
    }"
    @click="$emit('trigger')"
  >
    {{ text }}
  </button>
</template>
