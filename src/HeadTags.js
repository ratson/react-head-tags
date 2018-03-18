import React from 'react'
import invariant from 'fbjs/lib/invariant'

import HeadTagsContext from './HeadTagsContext'

class HeadTags extends React.Component {
  componentWillUnmount() {
    const { children } = this.props
    if (this.reactHeadTags) {
      this.reactHeadTags.remove(children)
    }
  }

  render() {
    const { children } = this.props
    return (
      <HeadTagsContext.Consumer>
        {reactHeadTags => {
          this.reactHeadTags = reactHeadTags

          invariant(
            reactHeadTags,
            'You should not use <HeadTags> outside a <HeadManager>',
          )

          if (reactHeadTags) {
            reactHeadTags.add(children)
          }
          return null
        }}
      </HeadTagsContext.Consumer>
    )
  }
}

export default HeadTags
