/** @jsx h */

import h from '@macgreg/slate-hyperscript'

export const input = <block type="paragraph">word</block>

export const output = {
  object: 'block',
  type: 'paragraph',
  data: {},
  nodes: [
    {
      object: 'text',
      leaves: [
        {
          object: 'leaf',
          text: 'word',
          marks: [],
        },
      ],
    },
  ],
}
