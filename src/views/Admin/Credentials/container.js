import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _i18n from './i18n'

import { connect } from 'react-redux'

import {
  createNavbarSelector,
  createRouteDocumentTitleSelector
} from 'util/route'

import DocumentTitle from 'react-document-title'
import { NavTabs } from 'components/NavTabs'

import classes from './container.scss'

const navbarSelector = createNavbarSelector()
const documentTitleSelector = createRouteDocumentTitleSelector()

function mapStateToProps (state, props) {
  const navbars = navbarSelector(props, props.i18n || _i18n)
  return {
    navbars,
    title: documentTitleSelector(props, props.i18n || _i18n)
  }
}

export class AdminCredentialContainer extends Component {
  static propTypes = {
    navbars: PropTypes.array.isRequired,
    children: PropTypes.node,
    title: PropTypes.string,
    i18n: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  }

  static defaultProps = {
    i18n: _i18n,
  }

  render () {
    const { navbars, title, children } = this.props
    return <div>
      <NavTabs className={classes.navbar} navbars={navbars} />
      <DocumentTitle title={title}>
        {children}
      </DocumentTitle>
    </div>
  }
}

export default connect(mapStateToProps)(AdminCredentialContainer)
