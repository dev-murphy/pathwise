<script setup lang="ts">
import { FIELD_TYPE_LABELS, OPTIONS_TYPES } from '~/types/flow'
import { FIELD_TYPE_ICONS } from '~/types/icons'
import type { FieldType, FieldOption } from '~/types/flow'

const props = defineProps<{
  mode: 'addField' | 'editField'
  fieldLabel: string
  fieldType: FieldType
  fieldRequired: boolean
  fieldOptions: FieldOption[]
  routeTargetOptions: { id: string; label: string }[]
  newOptionText: string
  fieldPlaceholder: string
  fieldMaxLength: number | null
}>()

const emit = defineEmits<{
  (e: 'update:fieldLabel', v: string): void
  (e: 'update:fieldType', v: FieldType): void
  (e: 'update:fieldRequired', v: boolean): void
  (e: 'update:newOptionText', v: string): void
  (e: 'update:fieldPlaceholder', v: string): void
  (e: 'update:fieldMaxLength', v: number | null): void
  (e: 'addOption'): void
  (e: 'removeOption', id: string): void
  (e: 'setOptionTarget', optionId: string, targetNodeId: string): void
  (e: 'save'): void
}>()

const fieldTypeOptions = Object.entries(FIELD_TYPE_LABELS).map(([id, label]) => ({ id, label }))
const fieldTypeIcons = Object.values(FIELD_TYPE_ICONS)

const showOptionsEditor = computed(() => OPTIONS_TYPES.includes(props.fieldType))
const showPlaceholder = computed(() => ['text', 'textarea', 'number'].includes(props.fieldType))
const showMaxLength = computed(() => ['text', 'textarea'].includes(props.fieldType))
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <p class="text-xs text-muted font-mono uppercase tracking-widest">
      {{ mode === 'editField' ? 'Edit Field' : 'Add Field' }}
    </p>

    <p class="text-xs text-muted font-mono">Field label</p>
    <textarea
      :value="fieldLabel"
      placeholder="Enter field label..."
      rows="2"
      class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none p-2 text-text text-sm rounded resize-none transition-colors duration-200 font-mono"
      @input="emit('update:fieldLabel', ($event.target as HTMLTextAreaElement).value)"
    />

    <p class="text-xs text-muted font-mono">Type</p>
    <XSelect
      id="field-type"
      :model-value="fieldType"
      :options="fieldTypeOptions.map(o => o.id)"
      :display-options="fieldTypeOptions.map(o => o.label)"
      :icon-options="fieldTypeIcons"
      @update:model-value="emit('update:fieldType', $event as FieldType)"
    />

    <!-- Placeholder -->
    <template v-if="showPlaceholder">
      <p class="text-xs text-muted font-mono mt-1">Placeholder</p>
      <input
        :value="fieldPlaceholder"
        placeholder="e.g. Enter your answer..."
        class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200 font-mono"
        @input="emit('update:fieldPlaceholder', ($event.target as HTMLInputElement).value)"
      />
    </template>

    <!-- Max length -->
    <template v-if="showMaxLength">
      <p class="text-xs text-muted font-mono mt-1">Max characters</p>
      <input
        :value="fieldMaxLength ?? ''"
        type="number"
        min="1"
        placeholder="No limit"
        class="w-full bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200 font-mono"
        @input="emit('update:fieldMaxLength', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
      />
    </template>

    <!-- Options editor -->
    <template v-if="showOptionsEditor">
      <p class="text-xs text-muted font-mono mt-1">Options</p>
      <div class="flex gap-x-2">
        <input
          :value="newOptionText"
          placeholder="Add option..."
          class="grow bg-surface-2 border border-border focus:border-accent focus:outline-none px-2 py-1.5 text-text text-sm rounded transition-colors duration-200 font-mono"
          @input="emit('update:newOptionText', ($event.target as HTMLInputElement).value)"
          @keydown.enter.prevent="emit('addOption')"
        />
        <XButton text="Add" variants="default" @trigger="emit('addOption')" />
      </div>

      <ul v-if="fieldOptions.length" class="flex flex-col gap-y-1.5">
        <li
          v-for="opt in fieldOptions"
          :key="opt.id"
          class="flex flex-col gap-y-1.5 px-2 py-2 bg-surface-2 border border-border rounded"
        >
          <div class="flex items-center justify-between gap-x-2">
            <span class="text-text text-xs font-mono truncate grow">{{ opt.label }}</span>
            <button
              class="shrink-0 text-muted hover:text-accent-3 transition-colors duration-150 cursor-pointer"
              @click="emit('removeOption', opt.id)"
            >
              <Delete class="w-3.5 h-3.5" />
            </button>
          </div>
          <XSelect
            :id="`opt-target-${opt.id}`"
            :model-value="opt.targetNodeId ?? ''"
            :options="routeTargetOptions.map(o => o.id)"
            :display-options="routeTargetOptions.map(o => o.label)"
            has-default-value
            @update:model-value="emit('setOptionTarget', opt.id, $event)"
          />
        </li>
      </ul>
    </template>

    <!-- Required toggle -->
    <label class="flex items-center gap-x-2 mt-1 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="fieldRequired"
        class="accent-accent w-3.5 h-3.5 cursor-pointer"
        @change="emit('update:fieldRequired', ($event.target as HTMLInputElement).checked)"
      />
      <span class="text-xs text-muted font-mono">Required</span>
    </label>

    <XButton
      :text="mode === 'editField' ? 'Save Changes' : 'Add Field'"
      size="expand"
      :variants="fieldLabel.trim() ? 'primary' : 'default'"
      @trigger="emit('save')"
    />
  </div>
</template>
