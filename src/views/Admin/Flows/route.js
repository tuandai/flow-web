import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { RedirectToIndex } from 'components/Route'

import Component from './index'
import ListComponent from './List'
import MembersComponent from './Members'

export default function (path, store) {
  return <Route path={path} component={Component}
    icon='icon-branches' text='flow' navbar>
    <IndexRoute i18n='list' navbar component={ListComponent} />
    <Route path='members' navbar component={MembersComponent} />
    <RedirectToIndex from='*' />
  </Route>
}
