/* globals document */
import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment'
import invariant from 'fbjs/lib/invariant'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NanoEvents from 'nanoevents'

import Head from './Head'

function buildSelectot(component) {
  invariant(component.props, `Unexpected <HeadTags> children: [${typeof component}] ${component}`)

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
    case 'link': {
      const { rel } = component.props
      if (['canonical'].includes(rel)) {
        return `link[rel="${rel}"]`
      }
      break
    }
    default:
  }

  return JSON.stringify({
    type: component.type,
    props: component.props,
  })
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
    this.selectorIndex = {}
  }

  getChildContext() {
    const { headTags, headTagsIndex, selectorIndex } = this
    const { onHeadTagsChange } = this.props
    return {
      reactHeadTags: {
        add: children => {
          const changes = React.Children.map(children, component => {
            const selector = buildSelectot(component)
            const i = headTagsIndex[selector]
            if (i >= 0) {
              const existingComponent = headTags[i]
              if (existingComponent === component) {
                return false
              }
              selectorIndex[component] = selectorIndex[existingComponent]
              delete selectorIndex[existingComponent]
              headTags[i] = component
              return true
            }

            headTagsIndex[selector] = headTags.length
            selectorIndex[component] = selector
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
        remove: children => {
          React.Children.forEach(children, component => {
            const selector = selectorIndex[component]
            const i = headTagsIndex[selector]
            // TODO null is insert to avoid updating other indexes,
            // should use better data structure to not use placeholder
            headTags.splice(i, 1, null)
            delete headTagsIndex[selector]
            delete selectorIndex[component]
          })
        },
      },
    }
  }

  render() {
    const { children } = this.props
    return (
      <React.Fragment>
        {children}
        <Head emitter={this.emitter} tags={this.headTags} />
      </React.Fragment>
    )
  }
}

export default HeadManager
