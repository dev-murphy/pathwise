import type { Component } from 'vue'
import type { FieldType } from './flow'

// These are resolved at runtime via unplugin-vue-components auto-imports.
// We use defineAsyncComponent-style dynamic imports to avoid circular dependency issues.
import IconText from '~/components/icons/Text.vue'
import IconParagraph from '~/components/icons/Paragraph.vue'
import IconNumber from '~/components/icons/Number.vue'
import IconDropdown from '~/components/icons/Dropdown.vue'
import IconRadio from '~/components/icons/Radio.vue'
import IconMultiSelect from '~/components/icons/MultiSelect.vue'
import IconCheckbox from '~/components/icons/Checkbox.vue'

export const FIELD_TYPE_ICONS: Record<FieldType, Component> = {
  text: IconText,
  textarea: IconParagraph,
  number: IconNumber,
  dropdown: IconDropdown,
  radio: IconRadio,
  multiselect: IconMultiSelect,
  checkbox: IconCheckbox,
}
