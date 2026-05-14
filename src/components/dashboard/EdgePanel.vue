<script setup lang="ts">
const props = defineProps<{
  edgeLabelText: string
}>()

const emit = defineEmits<{
  (e: 'update:edgeLabelText', v: string): void
  (e: 'save'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <p class="text-xs text-muted font-mono uppercase tracking-widest">Edit Answer</p>

    <p class="text-xs text-muted font-mono">Answer label</p>
    <input
      :value="edgeLabelText"
      placeholder="Enter answer label..."
      class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200 font-mono"
      @input="emit('update:edgeLabelText', ($event.target as HTMLInputElement).value)"
    />

    <XButton
      text="Save Changes"
      size="expand"
      :variants="edgeLabelText.trim() ? 'primary' : 'default'"
      @trigger="emit('save')"
    />
    <XButton
      text="Delete Connection"
      size="expand"
      variants="default"
      @trigger="emit('delete')"
    />
  </div>
</template>
