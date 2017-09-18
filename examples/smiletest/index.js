
import { Editor } from 'slate-react'
import { State } from 'slate'
import Html from 'slate-html-serializer'
import PropTypes from 'prop-types';

import React from 'react'
import initialState from './state.json'

const temacrostyle = {
  border: '1px solid #b6c1d2',
  borderRadius: 500, // unless the font is bigger than 500px tall it will always round
  padding: '1px 8px 0px 8px',
  display: 'inline-block',
  backgroundColor: 'rgba(231, 235, 242, .7)',
  marginBottom: 1
}

/**
 * Define the default node type.
 */

const DEFAULT_NODE = 'paragraph'

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
  nodes: {
    'bulleted-list': props => <ul {...props.attributes}>{props.children}</ul>,
    'list-item': props => <li {...props.attributes}>{props.children}</li>,
    'numbered-list': props => <ol {...props.attributes}>{props.children}</ol>,
    'temacro-snippet': (props) => {
      const { data } = props.node
      const abbreviation = data.get('abbreviation')
      let useStyle = temacrostyle
      if (props.isSelected) {
        useStyle = Object.assign({}, temacrostyle)
        useStyle.textDecoration = 'underline'
      }
      return <span style={useStyle} {...props.attributes}>snippet: {abbreviation}</span>
    }
  },
  marks: {
    bold: {
      fontWeight: 'bold'
    },
    code: {
      fontFamily: 'monospace',
      backgroundColor: '#eee',
      padding: '3px',
      borderRadius: '4px'
    },
    italic: {
      fontStyle: 'italic'
    },
    underlined: {
      textDecoration: 'underline'
    }
  }
}

const BLOCK_TAGS = {
  ul: 'bulleted-list',
  ol: 'numbered-list',
  li: 'list-item',
  p: 'paragraph'
}

const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
  pre: 'code'
}

// Special React components only for rendering to XHTML
const TE_XHTML_SerializedMacro = function (props) { // eslint-disable-line func-style
  return <te_embed data-abbreviation={props.abbreviation} />
}

TE_XHTML_SerializedMacro.propTypes = {
  abbreviation: PropTypes.string.isRequired
}

// Serialization rules
const rules = [
  {
    // Handle blocks...
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (!type) return
      return {
        kind: 'block',
        type,
        nodes: next(el.childNodes)
      }
    },
    serialize(object, children) {
      if (object.kind != 'block') return
      switch (object.type) {
        case 'numbered-list': return <ol>{children}</ol>
        case 'bulleted-list': return <ul>{children}</ul>
        case 'list-item': return <li>{children}</li>
        case 'paragraph': return <p>{children}</p>
      }
    }
  },
  // Handle marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (!type) return
      return {
        kind: 'mark',
        type,
        nodes: next(el.childNodes)
      }
    },
    serialize(object, children) {
      if (object.kind != 'mark') return
      switch (object.type) {
        case 'bold': return <strong>{children}</strong>
        case 'italic': return <em>{children}</em>
        case 'underline': return <u>{children}</u>
        case 'code': return <pre>{children}</pre>
      }
    }
  },
  // Handle our macro
  {
    deserialize(el, next) {
      const tagName = el.tagName.toLowerCase()
      if (tagName != 'te_embed') return
      const abbreviation = el.dataset.abbreviation || ''
      return {
        kind: 'inline',
        type: 'temacro-snippet',
        data: { abbreviation },
        isVoid: true
      }
    },
    serialize(object, children) {
      if (object.kind != 'inline' || object.type != 'temacro-snippet') return
      return <TE_XHTML_SerializedMacro abbreviation={object.data.get('abbreviation') || 'ERROR'} />
    }
  }
]

const htmlSerializer = new Html({ rules })

/**
 * A helper to standardize snippet Inline data format.
 *
 * @param {String} abbreviation
 * @return {Object}
 */

function dataForSnippet(abbreviation) {
  return {
    type: 'temacro-snippet',
    data: { abbreviation },
    isVoid: true
  }
}

/**
 * A change helper to standardize wrapping snippet references.
 *
 * @param {Change} change
 * @param {String} href
 */

function wrapSnippet(change, abbreviation) {
  change.wrapInline(dataForSnippet(abbreviation))

  change.collapseToEnd()
}

/**
 * The rich text example.
 *
 * @type {Component}
 */

class SmileTest extends React.Component {

  /**
   * Deserialize the initial editor state.
   *
   * @type {Object}
   */

  state = {
    state: State.fromJSON(initialState),
  }

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasMark = (type) => {
    const { state } = this.state
    return state.activeMarks.some(mark => mark.type == type)
  }

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasBlock = (type) => {
    const { state } = this.state
    return state.blocks.some(node => node.type == type)
  }

  /**
   * Check whether the current selection has a snippet reference in it.
   *
   * @return {Boolean} hasSnippet
   */

  hasSnippet = () => {
    const { state } = this.state
    return state.inlines.some(inline => inline.type == 'temacro-snippet')
  }

  /**
   * On change, save the new `state`.
   *
   * @param {Change} change
   */

  onChange = ({ state }) => {
    this.setState({ state })
  }

  /**
   * On key down, if it's a formatting command toggle a mark.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {Change} change
   * @return {Change}
   */

  onKeyDown = (e, data, change) => {
    if (!data.isMod) return
    let mark

    switch (data.key) {
      case 'b':
        mark = 'bold'
        break
      case 'i':
        mark = 'italic'
        break
      case 'u':
        mark = 'underlined'
        break
      case '`':
        mark = 'code'
        break
      default:
        return
    }

    e.preventDefault()
    change.toggleMark(mark)
    return true
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickMark = (e, type) => {
    e.preventDefault()
    const { state } = this.state
    const change = state.change().toggleMark(type)
    this.onChange(change)
  }

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickBlock = (e, type) => {
    e.preventDefault()
    const { state } = this.state
    const change = state.change()
    const { document } = state

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        change
          .setBlock(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      }

      else {
        change
          .setBlock(isActive ? DEFAULT_NODE : type)
      }
    }

    // Handle the extra wrapping required for list buttons.
    else {
      const isList = this.hasBlock('list-item')
      const isType = state.blocks.some((block) => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        change
          .setBlock(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        change
          .unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
          .wrapBlock(type)
      } else {
        change
          .setBlock('list-item')
          .wrapBlock(type)
      }
    }

    this.onChange(change)
  }

  /**
   * When clicking the snippet-ify button, if the selection has a snippet reference in it, remove the ref.
   * Otherwise, add a new snippet reference.
   *
   * @param {Event} e
   */

  onClickSnippetButton = (e, containsSnippetAlready) => {
    e.preventDefault()
    if (containsSnippetAlready) {
      return
    }
    const { state } = this.state
    const change = state.change()

    let useSelectedString
    if (state.isExpanded) {
      // Do not use a selection that extends beyond a single block
      const { document, selection } = state
      const blocks = document.getBlocksAtRange(selection)
      const charList = state.characters
      if (blocks.size === 1 && charList.some(Chrr => Chrr.text.trim().length > 0)) {
        // BBNOTE: Tried to go with the simple-seeming: useSelectedString = document.getFragmentAtRange(selection).text
        // here.
        // Unfortunately it does not work as documented - document.getFragmentAtRange(selection) returns an empty Document
        useSelectedString = charList.reduce((accum, Chrr) => accum + Chrr.text, '')
      }
    }

    if (useSelectedString) {
      change.call(wrapSnippet, useSelectedString)
    }
    else {
      const abbv = window.prompt('Enter the snippet abbreviation:')
      if (!abbv) {
        return
      }
      if (state.isExpanded) {
        change.collapseToEnd()
      }
      change.insertInline(dataForSnippet(abbv))
        // .insertText(abbv)
        // .extend(0 - abbv.length)
        // .call(wrapSnippet, useSelectedString)
    }

    this.onChange(change)
  }

  /**
   * Clicked the save button.
   *
   * @param {Event} e
   */

  onClickSave = (e) => {
    const { state } = this.state
    e.preventDefault()
    // Create a new serializer instance with our `rules` from above.
    const htmlStr = htmlSerializer.serialize(state)
    console.log(`The HTML: ${JSON.stringify(htmlStr)}`);// eslint-disable-line
    console.log(`The JSON: ${JSON.stringify(state.document.toJSON())}`);// eslint-disable-line
    return
  }

  /**
   * Clicked the import button.
   *
   * @param {Event} e
   */

  onClickImport = (e) => {
    e.preventDefault()
    const inputHTML = window.prompt('Enter the snippet XHTML:')
    if (!inputHTML) {
      return
    }
    const newState = htmlSerializer.deserialize(inputHTML)
    this.setState({ state: newState })
    return
  }

  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    )
  }

  /**
   * Render the toolbar.
   *
   * @return {Element}
   */

  renderToolbar = () => {
    return (
      <div className="menu toolbar-menu">
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        {this.renderSnippetButton()}
        {this.renderBlockButton('block-quote', 'format_quote')}
        {this.renderBlockButton('numbered-list', 'format_list_numbered')}
        {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
        {this.renderSaveButton()}
        {this.renderImportButton()}
      </div>
    )
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)
    const onMouseDown = e => this.onClickMark(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  /**
   * Render a save toolbar button.
   *
   * @return {Element}
   */

  renderSaveButton = () => {
    const { state } = this.state
    const isActive = !state.document.isEmpty
    const onMouseDown = e => this.onClickSave(e)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">save</span>
      </span>
    )
  }

  /**
   * Render an import toolbar button.
   *
   * @return {Element}
   */

  renderImportButton = () => {
    const onMouseDown = e => this.onClickImport(e)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active>
        <span className="material-icons">open_in_new</span>
      </span>
    )
  }

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton = (type, icon) => {
    const isActive = this.hasBlock(type)
    const onMouseDown = e => this.onClickBlock(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  /**
   * Render a toolbar button that snippet-ifies the selected text
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderSnippetButton = () => {
    const isActive = this.hasSnippet()
    const onMouseDown = e => this.onClickSnippetButton(e, isActive)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">format_paint</span>
      </span>
    )
  }

  /**
   * Render the Slate editor.
   *
   * @return {Element}
   */

  renderEditor = () => {
    return (
      <div className="editor">
        <Editor
          state={this.state.state}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          schema={schema}
          placeholder={'Enter some rich text...'}
          spellCheck
        />
      </div>
    )
  }

}

/**
 * Export.
 */

export default SmileTest
