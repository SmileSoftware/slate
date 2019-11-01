import { Editor, getEventTransfer } from '@macgreg/slate-react'
import { Value } from '@macgreg/slate'

import React from 'react'
import initialValueAsJson from './value.json'
import { css } from 'emotion'
import { Button, Icon, Toolbar } from '../components'

const prefix = 'EMOJI-DATA-EMBED::'

/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Value.fromJSON(initialValueAsJson)

/**
 * Emojis.
 *
 * @type {Array}
 */

const EMOJIS = [
  '😃',
  '😬',
  '😂',
  '😅',
  '😆',
  '😍',
  '😱',
  '👋',
  '👏',
  '👍',
  '🙌',
  '👌',
  '🙏',
  '👻',
  '🍔',
  '🍑',
  '🔑',
]

/**
 * The links example.
 *
 * @type {Component}
 */

class Emojis extends React.Component {
  /**
   * The editor's schema.
   *
   * @type {Object}
   */

  schema = {
    inlines: {
      emoji: {
        isVoid: true,
      },
    },
  }

  /**
   * Store a reference to the `editor`.
   *
   * @param {Editor} editor
   */

  ref = editor => {
    this.editor = editor
  }

  /**
   * Render the app.
   *
   * @return {Element} element
   */

  render() {
    return (
      <div>
        <Toolbar>
          {EMOJIS.map((emoji, i) => (
            <Button key={i} onMouseDown={e => this.onClickEmoji(e, emoji)}>
              <Icon>{emoji}</Icon>
            </Button>
          ))}
        </Toolbar>
        <Editor
          placeholder="Write some 😍👋🎉..."
          ref={this.ref}
          defaultValue={initialValue}
          schema={this.schema}
          renderBlock={this.renderBlock}
          renderInline={this.renderInline}
          onEventError={this.onEventError}
          onCopy={this.onCopy}
          onPaste={this.onPaste}
        />
      </div>
    )
  }

  /**
   * Render a Slate block.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderBlock = (props, editor, next) => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>
      default:
        return next()
    }
  }

  /**
   * Render a Slate inline.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderInline = (props, editor, next) => {
    const { attributes, node, isFocused } = props

    switch (node.type) {
      case 'emoji':
        return (
          <span
            {...attributes}
            contentEditable={false}
            onDrop={e => e.preventDefault()}
            className={css`
              outline: ${isFocused ? '2px solid blue' : 'none'};
            `}
          >
            {node.data.get('code')}
          </span>
        )
      default:
        return next()
    }
  }

  parseEmojiStringIntoNodeProperties = text => {
    try {
      return JSON.parse(text.substring(prefix.length))
    } catch (err) {
      throw new Error('Unable to parse custom Emoji drag event data.')
    }
  }

  onPaste = (event, editor, next) => {
    const transfer = getEventTransfer(event)
    const text = transfer.text

    // If the transfer text has our prefix it is an emoji. To paste we need to rehydrate it and insert the node.
    if (text.substring(0, prefix.length) === prefix) {
      const nodeProps = this.parseEmojiStringIntoNodeProperties(text)

      this.editor
        .insertInline(nodeProps)
        .moveToStartOfNextText()
        .focus()

      event.preventDefault()
      return
    }

    next()
  }

  /**
   * On copy.
   *
   * @param {error} change
   */

  onCopy = (event, editor, next) => {
    const { value } = editor
    const { document, selection } = value
    const { start, end } = selection
    let emojiNode = document.getClosestInline(start.path)

    if (!emojiNode) {
      emojiNode = document.getClosestInline(end.path)
    }

    if (emojiNode && emojiNode.type === 'emoji') {
      const clipboardDictionary = { type: 'emoji', data: emojiNode.data }
      const nodeString = JSON.stringify(clipboardDictionary)

      const string = prefix + nodeString
      event.clipboardData.setData('text/plain', string)
      event.preventDefault()
      return
    }

    return next()
  }

  /**
   * On event error.
   *
   * @param {error} change
   */

  onEventError = error => {
    console.log('throw error')
    console.log(error)
  }

  /**
   * When clicking a emoji, insert it
   *
   * @param {Event} e
   */

  onClickEmoji = (e, code) => {
    e.preventDefault()

    this.editor
      .insertInline({ type: 'emoji', data: { code } })
      .moveToStartOfNextText()
      .focus()
  }
}

/**
 * Export.
 */

export default Emojis
