/* globals document */
import React from 'react'
import { createPortal } from 'react-dom'

class Head extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canUseDOM: false,
      tags: props.tags,
    }
  }

  componentWillMount() {
    const { emitter } = this.props
    emitter.on('tags', tags => {
      this.setState({
        tags,
      })
    })
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ canUseDOM: true })
  }

  render() {
    const { canUseDOM, tags } = this.state
    if (canUseDOM) {
      return createPortal(tags, document.head)
    }

    return null
  }
}

export default Head
