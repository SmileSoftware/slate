/* eslint-disable no-console */

import { Editor } from '@macgreg/slate-react'
import { Value } from '@macgreg/slate'

import React from 'react'
import faker from 'faker'

/**
 * Create a huge JSON document.
 *
 * @type {Object}
 */

const HEADINGS = 100
const PARAGRAPHS = 8 // Paragraphs per heading
const nodes = []
const json = {
  document: { nodes },
}

for (let h = 0; h < HEADINGS; h++) {
  nodes.push({
    object: 'block',
    type: 'heading',
    nodes: [{ object: 'text', leaves: [{ text: faker.lorem.sentence() }] }],
  })

  for (let p = 0; p < PARAGRAPHS; p++) {
    nodes.push({
      object: 'block',
      type: 'paragraph',
      nodes: [{ object: 'text', leaves: [{ text: faker.lorem.paragraph() }] }],
    })
  }
}

/**
 * The huge document example.
 *
 * @type {Component}
 */

class HugeDocument extends React.Component {
  /**
   * Deserialize the initial editor value.
   *
   * @type {Object}
   */

  state = { value: Value.fromJSON(json, { normalize: false }) }

  /**
   * Render the editor.
   *
   * @return {Component} component
   */

  render() {
    return (
      <Editor
        placeholder="Enter some text..."
        spellCheck={false}
        value={this.state.value}
        onChange={this.onChange}
        renderNode={this.renderNode}
        renderMark={this.renderMark}
      />
    )
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = props => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'heading':
        return <h1 {...attributes}>{children}</h1>
    }
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderMark = props => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
    }
  }

  /**
   * On change.
   *
   * @param {Change} change
   */

  onChange = ({ value }) => {
    this.setState({ value })
  }
}

/**
 * Export.
 */

export default HugeDocument
