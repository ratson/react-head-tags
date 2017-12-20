/* globals document */
import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NanoEvents from 'nanoevents'
import Head from './Head'

function buildSelectot(component) {
  const { id } = component.props
  if (id) {
    return `#${id}`
  }

  switch (component.type) {
    case 'title':
      return 'title'
    case 'meta': {
      const { name, property } = component.props
      if (name) {
        return `meta[name="${name}"]`
      }
      if (property) {
        return `meta[property="${property}"]`
      }
      break
    }
    default:
  }

  return JSON.stringify(component)
}

class HeadManager extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  static childContextTypes = {
    reactHeadTags: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.emitter = new NanoEvents()
    this.headTags = []
    this.headTagsIndex = {}
  }

  getChildContext() {
    const { headTags, headTagsIndex } = this
    const { onHeadTagsChange } = this.props
    return {
      reactHeadTags: {
        add: children => {
          const changes = React.Children.map(children, component => {
            const selector = buildSelectot(component)
            const i = headTagsIndex[selector]
            if (i >= 0) {
              if (headTags[i] === component) {
                return false
              }
              headTags[i] = component
              return false
            }

            headTagsIndex[selector] = headTags.length
            headTags.push(component)

            if (ExecutionEnvironment.canUseDOM && selector.indexOf('{') !== 0) {
              const el = document.head.querySelector(selector)
              if (el) {
                document.head.removeChild(el)
              }
            }

            return true
          })

          if (changes.some(hasChange => hasChange)) {
            if (onHeadTagsChange) {
              onHeadTagsChange(headTags)
            } else {
              this.emitter.emit('tags', headTags)
            }
          }
        },
      },
    }
  }

  render() {
    const { children } = this.props
    return (
      <React.Fragment>
        <Head emitter={this.emitter} />
        {children}
      </React.Fragment>
    )
  }
}

export default HeadManager
