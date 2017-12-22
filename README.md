# react-head-tags

ReactDOMServer.renderToNodeStream() ready component to manage document.head

## Installation

```
npm install react-head-tags --save
```

## Usage

<!-- eslint-disable no-unused-vars -->

```js
import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { HeadManager, HeadTags } from 'react-head-tags'

let headTags
renderToNodeStream(
  <HeadManager
    onHeadTagsChange={tags => {
      headTags = tags
    }}
  >
    <HeadTags>
      <title>Title</title>
      <meta name="description" content="testing" />
    </HeadTags>
  </HeadManager>,
)
```
