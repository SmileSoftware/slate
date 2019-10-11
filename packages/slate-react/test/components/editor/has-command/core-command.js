/** @jsx h */

import Plain from '@macgreg/slate-plain-serializer'

const defaultValue = Plain.deserialize('')

export const input = { defaultValue }

export default function(editor) {
  return editor.hasCommand('insertText')
}

export const output = true
