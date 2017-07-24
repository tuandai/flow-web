import React, { Component } from 'react'
import { isPromise, cancel } from 'redux-http'

import createStore from './store'
import { compose, spy, done } from './util'

/**
  args support:
    - [{ funcs: [funcNames], trigger: '' }]
  options: {
    withRef: boolean
  }
**/
export default function createHigherOrderComponent (settings, options) {
  const { withRef } = options || {}
  return function (WrappedComponent) {
    return class AutoCancelWrapper extends Component {
      constructor (props, context) {
        super(props, context)

        this.stores = createStore()
        this.funcs = {}

        settings.forEach(({ funcs, trigger }) => {
          const store = this.stores[trigger || 'unmount']
          if (!store) {
            return console.error('unsupport trigger:', trigger)
          }
          funcs.reduce((fs, name) => {
            fs[name] = this.createFunc(name, trigger, store)
            return fs
          }, this.funcs)
        })
      }

      componentWillUnmount () {
        const keys = Object.keys(this.stores)
        keys.forEach((key) => {
          this.stores[key].destroy()
        })
      }

      getWrappedInstance () {
        return this.refs.wrappedInstance
      }

      createFunc (name, trigger, store) {
        const fn = this.createRunPropsFunc(name)
        const watcher = this.createWatcher(name, store)

        const wrapper = compose(watcher, fn)
        let rs = wrapper
        if (trigger === 'unique') {
          rs = spy(this.createUniqueSpy(name, store), wrapper)
        }
        return rs
      }

      createRunPropsFunc (funcName) {
        return (...args) => {
          const fn = this.props[funcName]
          return fn && fn(...args)
        }
      }

      createWatcher (name, store) {
        return function (result) {
          if (isPromise(result)) {
            store.push(name, result)
            done(result, function () { store.remove(name, result) })
          }
          return result
        }
      }

      createUniqueSpy (name, store) {
        return function () {
          const prev = store.data[name]
          prev && cancel(prev) // it will auto remove on catch
        }
      }

      render () {
        const mergedProps = { ...this.props, ...this.funcs }
        const props = withRef ? { ...mergedProps, ref: 'wrappedInstance' } : mergedProps
        return React.createElement(WrappedComponent, props)
      }
    }
  }
}