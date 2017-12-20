import React from 'react'
import PropTypes from 'prop-types'

class HeadTags extends React.Component {
  static contextTypes = {
    reactHeadTags: PropTypes.object,
  }

  componentWillMount() {
    const { children } = this.props
    const { reactHeadTags } = this.context
    if (reactHeadTags) {
      reactHeadTags.add(children)
    }
  }

  render() {
    return null
  }
}

export default HeadTags
