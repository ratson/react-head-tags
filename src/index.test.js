/* globals document */
import { PassThrough } from 'stream'

import streamToPromise from 'stream-to-promise'
import intoStream from 'into-stream'
import multistream from 'multistream'

import React from 'react'
import { renderToString, renderToNodeStream } from 'react-dom/server'
import { mount } from 'enzyme'
import delay from 'delay'

import HeadTags, { HeadManager } from '.'

it('collect tags', async () => {
  document.head.innerHTML = ''
  let collectedHeadTags

  const data = await streamToPromise(
    renderToNodeStream(
      <HeadManager
        onHeadTagsChange={headTags => {
          collectedHeadTags = headTags
        }}
      >
        <HeadTags>
          <title>Title</title>
          <meta name="description" content="testing" />
        </HeadTags>
      </HeadManager>,
    ),
  )

  expect(collectedHeadTags).toHaveLength(2)
  expect(data.toString()).toBe('')
  expect(document.head.innerHTML).toBe('')
})

it('keep non-react tags', async () => {
  document.head.innerHTML = '<script></script>'

  mount(
    <HeadManager>
      <HeadTags>
        <title>Title</title>
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe('<script></script><title>Title</title>')
})

it('replace existing title', async () => {
  document.head.innerHTML =
    '<title data-reactroot="">SSR</title><script></script>'

  mount(
    <HeadManager>
      <HeadTags>
        <title>Title</title>
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe('<script></script><title>Title</title>')
})

it('render title once', async () => {
  document.head.innerHTML = ''

  const wrapper = mount(
    <HeadManager>
      <HeadTags>
        <title>Title</title>
      </HeadTags>
      <HeadTags>
        <title>Title2</title>
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe('<title>Title2</title>')
  expect(wrapper).toHaveHTML('<title>Title2</title>')
})

it('accumulate different meta tags by name', async () => {
  document.head.innerHTML = ''

  mount(
    <HeadManager>
      <HeadTags>
        <meta name="title" value="title" />
        <meta name="desc" value="desc" />
      </HeadTags>
      <HeadTags>
        <meta name="desc" value="desc1" />
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe(
    '<meta name="title" value="title"><meta name="desc" value="desc1">',
  )
})

it('keep single <link rel="canonical" />', async () => {
  document.head.innerHTML = ''

  mount(
    <HeadManager>
      <HeadTags>
        <link rel="canonical" href="http://localhost/old" />
      </HeadTags>
      <HeadTags>
        <link rel="canonical" href="http://localhost/new" />
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe(
    '<link rel="canonical" href="http://localhost/new">',
  )
})

it('set <script type="application/ld+json">', async () => {
  document.head.innerHTML = ''

  const ldJson = { '@context': 'http://schema.org' }
  mount(
    <HeadManager>
      <HeadTags>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </HeadTags>
    </HeadManager>,
  )
  await delay(0)

  expect(document.head.innerHTML).toBe(
    '<script type="application/ld+json">{"@context":"http://schema.org"}</script>',
  )
})

it('throw for non-compoent children', () => {
  document.head.innerHTML = ''

  expect(() => {
    renderToString(
      <HeadManager>
        <HeadTags>not-expected</HeadTags>
      </HeadManager>,
    )
  }).toThrowError(/not-expect/)
})

it('works with stream', async () => {
  let collectedHeadTags = []
  const contentStream = renderToNodeStream(
    <React.Fragment>
      <HeadManager
        onHeadTagsChange={headTags => {
          collectedHeadTags = headTags
        }}
      >
        <HeadTags>
          <title>Title</title>
          <meta name="description" content="testing" />
        </HeadTags>
      </HeadManager>
      <main>Content</main>
    </React.Fragment>,
  )
  const contentPass = new PassThrough()
  const res = new PassThrough()

  expect(collectedHeadTags).toHaveLength(0)
  contentStream.pipe(contentPass)
  expect(collectedHeadTags).toHaveLength(0)
  await streamToPromise(contentStream)
  expect(collectedHeadTags).toHaveLength(2)

  multistream([
    intoStream('<!doctype html><html><head>'),
    renderToNodeStream(collectedHeadTags),
    intoStream('</head><body>'),
    contentPass,
    intoStream('</body></html>'),
  ]).pipe(res)

  const data = await streamToPromise(res)
  expect(data.toString()).toBe(
    [
      '<!doctype html><html><head>',
      '<title data-reactroot="">Title</title><meta name="description" content="testing" data-reactroot=""/>',
      '</head><body>',
      '<main data-reactroot="">Content</main>',
      '</body></html>',
    ].join(''),
  )
})
