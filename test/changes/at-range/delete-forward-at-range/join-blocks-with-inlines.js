/** @jsx h */

import h from '../../../helpers/h'

export default function (change) {
  const texts = document.getTexts()
  const first = texts.first()
  const range = selection.merge({
    anchorKey: first.key,
    anchorOffset: first.text.length,
    focusKey: first.key,
    focusOffset: first.text.length
  })

  return state
    .change()
    .deleteForwardAtRange(range)
}

export const input = (
  <state>
    <document>
      <paragraph>one</paragraph>
      <paragraph>two
        <link>three</link>four
      </paragraph>
    </document>
  </state>
)

export const output = (
  <state>
    <document>
      <paragraph>onetwo
        <link>three</link>four
      </paragraph>
    </document>
  </state>
)