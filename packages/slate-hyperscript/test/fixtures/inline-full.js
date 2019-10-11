/** @jsx h */

import h from '@macgreg/slate-hyperscript'

export const input = <inline type="link">word</inline>

export const output = {
  object: 'inline',
  type: 'link',
  data: {},
  nodes: [
    {
      object: 'text',
      text: 'word',
      marks: [],
    },
  ],
}
