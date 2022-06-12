const initialState = {
  loading: false,
  redirect_to_login: false,
  config:{}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_REDRECT_TO_LOGIN_TRUE':
      return {
        ...state,
        redirect_to_login: true
      }
    case 'SET_REDRECT_TO_LOGIN_FALSE':
      return {
        ...state,
        redirect_to_login: false
      }
    case 'START_LOADER':
      return {
        ...state,
        loading: true,
      }
    case 'STOP_LOADER':
      return {
        ...state,
        loading: false,
      }

    // Admin Panel Functionality Reducers
    case 'SET_CONFIG_RESPONSE':
      return {
        ...state,
        config: action.config_response,
      }

    default:
      return state
  }
}

export default reducer