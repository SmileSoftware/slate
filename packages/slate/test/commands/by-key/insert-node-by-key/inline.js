/** @jsx h */

import h from '../../../helpers/h'
import { Inline } from '@macgreg/slate'

export default function(editor) {
  editor.insertNodeByKey('a', 0, Inline.create('emoji'))
}

export const input = (
  <value>
    <document>
      <paragraph key="a">
        <cursor />word
      </paragraph>
    </document>
  </value>
)

export const output = (
  <value>
    <document>
      <paragraph>
        <emoji />
        <cursor />word
      </paragraph>
    </document>
  </value>
)
