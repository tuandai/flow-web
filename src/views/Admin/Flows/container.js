import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import _i18n from './i18n'

import { connect } from 'react-redux'
import { STATUS } from 'redux-http'

import {
  createNavbarSelector,
  createRouteDocumentTitleSelector
} from 'util/route'

import DocumentTitle from 'react-document-title'
import { NavTabs } from 'components/NavTabs'
import Loading from 'components/Loading'

import classes from './container.scss'

const navbarSelector = createNavbarSelector()
const documentTitleSelector = createRouteDocumentTitleSelector()

function mapStateToProps (state, props) {
  const { flow } = state
  return {
    navbars: navbarSelector(props, _i18n),
    title: documentTitleSelector(props, _i18n),
    loading: flow.getIn(['ui', 'QUERY']) !== STATUS.success,
  }
}

export class AdminFlowsContainer extends PureComponent {
  static propTypes = {
    navbars: PropTypes.array.isRequired,
    title: PropTypes.string,
    loading: PropTypes.bool,
    children: PropTypes.node,
  }

  render () {
    const { loading, navbars, title, children } = this.props
    return <div>
      <NavTabs className={classes.navbar} navbars={navbars} />
      {loading ? <Loading /> : <DocumentTitle title={title}>{children}
      </DocumentTitle>}
    </div>
  }
}

export default connect(mapStateToProps)(AdminFlowsContainer)
