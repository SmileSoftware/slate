/** @jsx h */

import h from '@macgreg/slate-hyperscript'

export const input = (
  <value>
    <document>
      <block type="paragraph">
        <cursor isFocused={false} />one
      </block>
    </document>
  </value>
)

export const options = {
  preserveSelection: true,
  preserveKeys: true,
}

export const output = {
  object: 'value',
  document: {
    object: 'document',
    key: '2',
    data: {},
    nodes: [
      {
        object: 'block',
        key: '1',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            key: '0',
            text: 'one',
            marks: [],
          },
        ],
      },
    ],
  },
  selection: {
    object: 'selection',
    anchor: {
      object: 'point',
      key: '0',
      path: [0, 0],
      offset: 0,
    },
    focus: {
      object: 'point',
      key: '0',
      path: [0, 0],
      offset: 0,
    },
    isFocused: false,
    marks: null,
  },
}
