import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Nav from './item'
import classnames from 'classnames'
import classes from './nav.scss'

export { classes }
export default class NavTabs extends Component {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,

    navs: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })).isRequired,
  }

  static defaultProps = {
    classNames: classes,
    navs: [],
  }

  renderMenus () {
    const { navs } = this.props
    return navs.map((nav) => <Nav
      key={nav.key || nav.to}
      to={nav.to}
      onlyActiveOnIndex
    >
      {nav.navbar}
    </Nav>)
  }

  render () {
    const { children, classNames, className } = this.props
    const cls = classnames(classNames.navs, className)

    return <div className={cls}>
      {this.renderMenus()}
      {children}
    </div>
  }
}
