import React from 'react'
import PropTypes from 'prop-types'
import invariant from 'fbjs/lib/invariant'

class HeadTags extends React.Component {
  static contextTypes = {
    reactHeadTags: PropTypes.object,
  }

  componentWillMount() {
    const { children } = this.props
    const { reactHeadTags } = this.context

    invariant(
      reactHeadTags,
      'You should not use <HeadTags> outside a <HeadManager>',
    )

    if (reactHeadTags) {
      reactHeadTags.add(children)
    }
  }

  render() {
    return null
  }
}

export default HeadTags
