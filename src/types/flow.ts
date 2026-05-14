export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'dropdown'
  | 'radio'
  | 'multiselect'
  | 'checkbox'

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  textarea: 'Textarea',
  number: 'Number',
  dropdown: 'Dropdown',
  radio: 'Radio',
  multiselect: 'Multiselect',
  checkbox: 'Checkbox',
}

/** Field types that support multiple outgoing branches */
export const MULTI_BRANCH_TYPES: FieldType[] = ['dropdown', 'radio', 'multiselect']

/** Field types that have a list of selectable options */
export const OPTIONS_TYPES: FieldType[] = ['dropdown', 'radio', 'multiselect']

export interface FieldOption {
  id: string
  label: string
  targetNodeId?: string
}

export interface QuestionNodeData {
  label: string
  fieldType: FieldType
  options: FieldOption[]
  isStart: boolean
  required: boolean
}
