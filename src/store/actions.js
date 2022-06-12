import Axios from 'axios'
import config from '../utils/config';

export const startLoader = () => ({
    type: 'START_LOADER',
})

export const stopLoader = () => ({
    type: 'STOP_LOADER',
})


export const setConfigResponse = (data) => {
    return {
        type: 'SET_CONFIG_RESPONSE',
        config_response: data
    }
}

// Admin-panel Functional actions
export const getConfig = () => {
    var headers = {
        language: "en",
        web_app_version: "1.0.0",
        auth_token: localStorage.getItem('MFA_AUTH_TOKEN')
    }
    return dispatch => {
        if (localStorage.getItem('MFA_AUTH_TOKEN') != null) {

            Axios.get(config.API_BASE_URL + 'getConfig', { headers: headers })
                .then(res => {
                    // console.log('\n\n REDUX RESPONSE->', res);
                    dispatch(setConfigResponse(res.data));
                })
                .catch(err => {
                    // displayLog(0, 'Network Error')
                });
        }
    }
}