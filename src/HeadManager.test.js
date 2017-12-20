import React from 'react'
import { renderToString } from 'react-dom/server'

import HeadManager from './HeadManager'

it('render children', () => {
  const html = renderToString(
    <HeadManager>
      <div>testing1</div>
      <div>testing2</div>
    </HeadManager>,
  )
  expect(html).toBe('<div>testing1</div><div>testing2</div>')
})
