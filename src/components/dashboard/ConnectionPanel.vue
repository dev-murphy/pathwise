<script setup lang="ts">
import type { FieldOption } from '~/types/flow'

const props = defineProps<{
  sourceOptions: FieldOption[]
  optionId: string
}>()

const emit = defineEmits<{
  (e: 'update:optionId', v: string): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <p class="text-xs text-muted font-mono uppercase tracking-widest">New Connection</p>

    <template v-if="sourceOptions.length">
      <p class="text-xs text-muted font-mono">Which option leads here?</p>
      <XSelect
        id="pending-option"
        :model-value="optionId"
        :options="sourceOptions.map(o => o.id)"
        :display-options="sourceOptions.map(o => o.label)"
        has-default-value
        @update:model-value="emit('update:optionId', $event)"
      />
    </template>
    <template v-else>
      <p class="text-xs text-muted font-mono italic">Add options to this field before connecting.</p>
    </template>

    <div class="flex gap-x-2">
      <XButton
        text="Save"
        size="expand"
        :variants="sourceOptions.length && optionId ? 'primary' : 'default'"
        @trigger="emit('confirm')"
      />
      <XButton text="Cancel" size="expand" variants="default" @trigger="emit('cancel')" />
    </div>
  </div>
</template>
