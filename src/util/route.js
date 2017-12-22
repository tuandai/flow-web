import { createSelector } from 'reselect'
import { Redirect, formatPattern } from 'react-router'

function defaultI18n (n) {
  return n
}
export function createNavbarSelector () {
  return createSelector(
    ({ route }) => [route.indexRoute, ...route.childRoutes],
    ({ routes, route, params }, i18n) => {
      const routeIndex = routes.indexOf(route)
      const parentPattern = Redirect.getRoutePattern(routes, routeIndex)
      const pattern = parentPattern.replace(/\/*$/, '/')
      return formatPattern(pattern, params)
    },
    (props, i18n) => i18n || defaultI18n,
    (routes, baseUrl, i18n) => {
      const navbars = routes.filter((route) => route && route.navbar)
      return navbars.map((nav) => {
        const path = nav.path || ''
        const i18nKey = nav.i18n || nav.path
        return {
          key: nav.path || '/',
          to: `${baseUrl}${path}`,
          navbar: i18n(`${i18nKey}.navbar`),
          title: i18n(`${i18nKey}.title`)
        }
      })
    }
  )
}

export function createRouteDocumentTitleSelector () {
  return createSelector(
    ({ routes, route }) => routes,
    ({ routes, route }) => route,
    (props, i18n) => i18n || defaultI18n,
    (routes, route, i18n) => {
      const index = routes.findIndex((r) => r === route)
      if (index > -1) {
        const route = routes[index + 1] // next route
        if (!route) {
          console.error('unable get child route')
          return undefined
        }
        const i18nKey = route.i18n || route.path
        return i18n(`${i18nKey}.title`)
      }
      return undefined
    }
  )
}
