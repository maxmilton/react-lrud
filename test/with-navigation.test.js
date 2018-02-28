/* eslint-env jest */

import React, { Component } from 'react'
import { shallow, mount } from 'enzyme'
import { withNavigation } from '../src/index'

describe('withNavigation', () => {
  const windowConsole = window.console

  afterEach(() => {
    window.console = windowConsole
  })

  class Passthrough extends Component {
    render () {
      return <div {...this.props} />
    }
  }

  it('should register using the id on props', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(<Navigable id='foo' />, { context: { navigation } })

    expect(navigation.register).toHaveBeenCalledTimes(1)
    expect(navigation.register.mock.calls[0][0]).toBe('foo')
  })

  it('should register using a generated unique id', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(<Navigable />, { context: { navigation } })
    shallow(<Navigable />, { context: { navigation } })

    const [ firstCall, secondCall ] = navigation.register.mock.calls

    expect(navigation.register).toHaveBeenCalledTimes(2)
    expect(firstCall[0]).toEqual(expect.stringMatching(/^Passthrough_\w+$/))
    expect(secondCall[0]).toEqual(expect.stringMatching(/^Passthrough_\w+$/))
    expect(firstCall).not.toEqual(secondCall)
  })

  it('should register a `vertical` item', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(
      <Navigable
        id='foo'
        vertical
      />,
      { context: { navigation } }
    )

    expect(navigation.register).toHaveBeenCalledWith('foo', {
      orientation: 'vertical'
    })
  })

  it('should register a `horizontal` item', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(
      <Navigable
        id='foo'
        horizontal
      />,
      { context: { navigation } }
    )

    expect(navigation.register).toHaveBeenCalledWith('foo', {
      orientation: 'horizontal'
    })
  })

  it('should register a `wrapping` item', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(
      <Navigable
        id='foo'
        vertical
        wrapping
      />,
      { context: { navigation } }
    )

    expect(navigation.register).toHaveBeenCalledWith('foo', {
      orientation: 'vertical',
      wrapping: true
    })
  })

  it('should warn when the `wrapping` prop is present without an orientation', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    window.console = { error: jest.fn() }

    shallow(
      <Navigable
        id='foo'
        wrapping
      />,
      { context: { navigation } }
    )

    expect(window.console.error).toHaveBeenCalledWith(
      expect.stringMatching(/The prop `wrapping` must be used in conjunction with one of the `vertical`\/`horizontal` props/)
    )
  })

  it('should register a `grid` item', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    shallow(
      <Navigable
        id='foo'
        grid
      />,
      { context: { navigation } }
    )

    expect(navigation.register).toHaveBeenCalledWith('foo', {
      grid: true,
      orientation: 'vertical'
    })
  })

  it('should register with `parent` from the child context', () => {
    const Navigable = withNavigation(Passthrough)
    const navigation = { register: jest.fn(), unregister: () => {} }

    const wrapper = mount(
      <Navigable id='foo'>
        <Navigable id='bar' />
      </Navigable>,
      { context: { navigation } }
    )

    expect(navigation.register).toHaveBeenCalledTimes(2)
    expect(navigation.register).toHaveBeenCalledWith('foo', { parent: undefined })
    expect(navigation.register).toHaveBeenLastCalledWith('bar', { parent: 'foo' })
    expect(wrapper.find(Navigable).last().instance().context.parent).toBe('foo')
  })
})