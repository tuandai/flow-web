import { handleActions } from 'redux-actions'
import { handleHttp } from 'redux/util'

import { defaultInitState, handlers } from 'redux/handler'
import { Map, fromJS } from 'immutable'

import is from 'util/is'

import Types from './jobType'
import FlowTypes from './flowType'

const initialState = defaultInitState.set('yml', new Map())
  .set('artifacts', new Map())

export function generatorJobId (flowId, jobNumber) {
  return `${flowId}-${jobNumber}`
}

function transform (d) {
  d.id = generatorJobId(d.nodePath, d.number)
  if (d.childrenResult) {
    d.childrenResult.forEach((node) => {
      node.jobId = d.id
      node.id = `${node.order}`
    })
  }
  if (d.status === 'YML_LOADING') {
    d.status = 'CREATED'
  }
  return d
}

function transformResponse (data) {
  if (is.array(data)) {
    data.forEach(transform)
  } else if (is.object(data) && data.number > -1) {
    transform(data)
  }
  return data
}

function transformPageResponse (data) {
  if (is.object(data) && data.content) {
    data.content = transformResponse(data.content)
  }
  return data
}

function getQueryParams (filter, getState) {
  const {
    branch, keyword, onlySelf,
    pullRequest, pageNumber, pageSize
   } = filter || {}
  const creator = onlySelf ? getState().session.getIn(['user', 'email']) : undefined
  const category = pullRequest ? 'PR' : undefined

  return {
    branch,
    keyword,
    creator,
    category,
    number: pageNumber || 1,
    size: pageSize || 30,
  }
}

export const actions = {
  query: function (flowId, filter) {
    return function (dispatch, getState) {
      const params = getQueryParams(filter, getState)
      return dispatch({
        url: '/jobs/limit/:flowName',
        name: Types.query,
        params: {
          flowName: flowId,
          ...params,
        },
        indicator: {
          pageNumber: params.number,
          pageSize: params.size,
        },
        transformResponse: transformPageResponse,
      })
    }
  },
  queryLastest: function (flowIds) {
    return {
      name: Types.queryLastest,
      url: 'jobs/status/latest',
      method: 'post',
      data: flowIds,
      transformResponse,
    }
  },
  get: function (flowId, jobNumber) {
    return {
      name: Types.get,
      url: 'jobs/:flowName/:jobNumber',
      params: {
        flowName: flowId,
        jobNumber: jobNumber,
      },
      indicator: {
        id: generatorJobId(flowId, jobNumber),
      },
      transformResponse,
    }
  },
  create: function (flowId, branch) {
    return {
      url: '/jobs/:flowName',
      method: 'post',
      params: {
        flowName: flowId,
        FLOW_GIT_BRANCH: branch
      }
    }
  },
  stop: function (flowId, jobNumber) {
    return {
      url: '/jobs/:flowName/:number/stop',
      method: 'post',
      name: Types.stop,
      indicator: {
        flowId: flowId,
        number: jobNumber,
      },
      params: {
        flowName: flowId,
        number: jobNumber,
      }
    }
  },
  getYml: function (flowId, jobNumber) {
    return {
      url: '/jobs/:flowName/:number/yml',
      name: Types.getYml,
      indicator: {
        id: generatorJobId(flowId, jobNumber),
      },
      params: {
        flowName: flowId,
        number: jobNumber,
      }
    }
  },
  queryArtifact (flowId, jobNumber) {
    return {
      url: '/jobs/:flowName/:number/artifacts',
      name: Types.queryArtifact,
      params: {
        flowName: flowId,
        number: jobNumber,
      },
      indicator: {
        id: generatorJobId(flowId, jobNumber),
      },
    }
  },
  setFilter: function (filter) {
    return {
      type: Types.updateFilter,
      payload: filter,
    }
  },
  freedFilter: function () {
    return {
      type: Types.freedFilter,
    }
  },
  freedResource: function (jobId) {
    return {
      type: Types.freedResource,
      id: jobId,
    }
  },
  /**
   * 如果是已经存过的 job 或者是新 job 则保存，否则丢弃
   */
  saveOrdiscarded: function (job) {
    return {
      type: Types.socketRecived,
      payload: transformResponse(job),
    }
  }
}

export default handleActions({
  [Types.query]: handleHttp('QUERY', {
    success: function (state, action) {
      const {
        payload: { content, totalSize },
        indicator: { pageNumber, pageSize },
      } = action
      const nextState = (pageNumber === 1 ? initialState : state)
        .update('ui', () => {
          return state.get('ui').merge(fromJS({
            pageNumber,
            pageSize,
            totalSize,
          }))
        })

      return handlers.saveAll(nextState, { payload: content })
    }
  }),
  [Types.get]: handleHttp('GET', {
    success: function (state, { payload }) {
      const job = { ...payload, childrenResult: undefined }
      return handlers.saveData(state, { payload: job })
    },
  }),
  [Types.socketRecived]: function (state, { payload }) {
    const job = { ...payload, childrenResult: undefined }
    const { id, number } = job
    const old = state.getIn(['data', id])
    if (old) {
      return handlers.saveData(state, { payload: job })
    }
    const lastId = state.get('list').last()
    const last = state.getIn(['data', lastId])
    const lastNumber = last ? last.get('number') : 0
    if (lastNumber < number) {
      // save to top list
      return handlers.unshift(state, { payload: job })
    }
  },
  [Types.getYml]: handleHttp('GET_YML', {
    success: function (state, { indicator, payload }) {
      const { id } = indicator
      return state.update('yml', (data) => {
        return data.set(id, payload)
      })
    },
  }),
  [Types.queryArtifact]: handleHttp('', {
    success (state, { indicator, payload }) {
      const { id } = indicator
      return state.update('artifacts', (data) => {
        return data.set(id, fromJS(payload))
      })
    }
  }),
  [Types.updateFilter]: function (state, { payload }) {
    return state.update('ui', (ui) => ui.set('filter', payload))
  },
  [Types.freedFilter]: function (state) {
    return state.update('ui', (ui) => ui.delete('filter'))
  },
  [FlowTypes.freed]: function (state) {
    return initialState
  }
}, initialState)
