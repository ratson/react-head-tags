/* globals document */
import streamToPromise from 'stream-to-promise'

import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { mount } from 'enzyme'

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

it('set <script type="application/ld+json">', () => {
  document.head.innerHTML = ''

  mount(
    <HeadManager>
      <HeadTags>
        <script type="application/ld+json">{'{"@context": "http://schema.org"}'}</script>
      </HeadTags>
    </HeadManager>,
  )

  expect(document.head.innerHTML).toBe(
    '<script type="application/ld+json">{"@context": "http://schema.org"}</script>',
  )
})
