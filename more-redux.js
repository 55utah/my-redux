/**
 * 参考：https://github.com/yinguangyao/simple-redux
 * 按照redux实际提供的API来实现简单版本，不考虑边界情况
 * 导出如下API:
 *  createStore,
 *  applyMiddleware,
 *  bindActionCreator,
 *  combineReducers,
 */


const bindActionCreator = (action, dispatch) => {
  return (...args) => dispatch(action(...args))
}

// 从右向左平铺包裹函数
// compose(a, b, c)() => a(b(c()))
const compose = (...funcs) => {
  if (!funcs) {
      return args => args
  }
  if (funcs.length === 1) {
      return funcs[0]
  }
  return funcs.reduce((f1, f2) => (...args) => f1(f2(...args)))
}

// 将reducer全部执行一遍
const combineReducers = reducers => {
  const finalReducers = {}
    nativeKeys = Object.keys
    nativeKeys(reducers).forEach(reducerKey => {
        if(typeof reducers[reducerKey] === "function") {
            finalReducers[reducerKey] = reducers[reducerKey]
        }
    })

  return (state, action) => {
    const store = {}
    nativeKeys(finalReducers).forEach(key => {
      const reducer = finalReducers[key]
      const nextState = reducer(state[key], action)
      store[key] = nextState
    })
    return store
  }
}

const applyMiddleware = (...middlewares) => {
  return (createStore) => (reducer, initState, enhancer) => {
      const store = createStore(reducer, initState, enhancer)
      const middlewareAPI = {
          getState: store.getState,
          dispatch: (action) => dispatch(action)
      }
      let chain = middlewares.map(middleware => middleware(middlewareAPI))
      store.dispatch = compose(...chain)(store.dispatch)
      return {
        ...store,
        dispatch
      }
    }
}

const createStore = (reducer, initState = null, enhancer) => {
  if (enhancer && typeof enhancer === "function") {
    return enhancer(createStore)(reducer, initState)
  }
  let store = initState, 
      listeners = [],
      isDispatch = false;
  const getState = () => store
  const dispatch = (action) => {
      if (isDispatch) return action
      // dispatch必须一个个来
      isDispatch = true
      store = reducer(store, action)
      isDispatch = false
      listeners.forEach(listener => listener())
      return action
  }
  const subscribe = (listener) => {
      if (typeof listener === "function") {
          listeners.push(listener)
      }
      return () => unsubscribe(listener)
  }
  const unsubscribe = (listener) => {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
  }
  return {
      getState,
      dispatch,
      subscribe,
      unsubscribe
  }
}

return {
  createStore,
  applyMiddleware,
  bindActionCreator,
  combineReducers,
}
