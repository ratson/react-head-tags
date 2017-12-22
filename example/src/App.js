import React, { Component } from 'react'

import { HeadTags, HeadManager } from 'lib'

const Page1 = () => (
  <div>
    <HeadTags>
      <title>page1</title>
      <meta name="title" value="title1" />
    </HeadTags>
    <h1>Page 1</h1>
  </div>
)

const Page2 = () => (
  <div>
    <HeadTags>
      <title>page2</title>
      <meta name="title" value="title2" />
      <meta name="desc" value="new meta" />
    </HeadTags>
    <h1>Page 2</h1>
  </div>
)

class App extends Component {
  state = {
    page: 1,
  }

  changePage = () => {
    const { page } = this.stae
    this.setState({
      page: page % 2 + 1,
    })
  }

  render() {
    return (
      <HeadManager>
        {this.state.page === 1 ? <Page1 /> : <Page2 />}
        <button onClick={this.changePage} type="button">
          Change Page
        </button>
      </HeadManager>
    )
  }
}

export default App
