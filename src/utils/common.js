import Joi from 'joi-browser';
import config from './config';
import history from './history';
import * as crypto from 'crypto-js';
import axios from 'axios';
import alertify from 'alertifyjs';
import store from './store';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'

export const buildSchema = (attributes) => {
  const joiKeys = {};
  for (const key in attributes) {
    let myJoi = Joi;
    if (attributes[key].type === 'String' || ((attributes[key].type === 'Reference' || attributes[key].type === 'Select') && attributes[key].multiple === false)) {
      myJoi = myJoi.string().strict().trim();
    }
    if ((attributes[key].type === 'Reference' || attributes[key].type === 'Select') && attributes[key].multiple === true) {
      myJoi = myJoi.array().items();
    }
    if (attributes[key].type === 'Number') {
      myJoi = myJoi.number();
    }
    if (attributes[key].type === 'Integer') {
      myJoi = myJoi.number().integer();
    }
    if (attributes[key].type === 'Email') {
      myJoi = myJoi.string().strict().trim().email({ minDomainSegments: 2 });
    }
    if (attributes[key].type === 'Boolean') {
      myJoi = myJoi.boolean().strict();
    }
    if (attributes[key].pattern) {
      myJoi = myJoi.pattern(attributes[key].pattern);
    }
    if (attributes[key].min && (attributes[key].type === 'String' || attributes[key].type === 'Number' || attributes[key].type === 'Integer' ||
      ((attributes[key].type === 'Reference' || attributes[key].type === 'Select') && attributes[key].multiple === false))) {
      myJoi = myJoi.min(attributes[key].min);
    }
    if (attributes[key].max && (attributes[key].type === 'String' || attributes[key].type === 'Number' || attributes[key].type === 'Integer' ||
      ((attributes[key].type === 'Reference' || attributes[key].type === 'Select') && attributes[key].multiple === false))) {
      myJoi = myJoi.max(attributes[key].max);
    }
    if (attributes[key].required === true && (attributes[key].type === 'Reference' || attributes[key].type === 'Select')) {
      myJoi = myJoi.min(1);
    }
    if (attributes[key].required === true) {
      myJoi = myJoi.required();
    }
    joiKeys[key] = myJoi;
  }
  return Joi.object().keys(joiKeys);
}


export const validateSchema = (body, schema) => {
  return new Promise((resolve, reject) => {
    Joi.validate(body, schema, (error, value) => {
    //  console.log("validateSchema", error.details[0].type)
      if (error) {
        let msg;
        let key = error.details[0].context.label || error.details[0].context.key;
        if (error.details[0].type.includes('empty')) {
          msg = 'Please enter ' + key.replace(/_/g, ' ') ;
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes('string.min')) {
          msg = key.replace(/_/g, ' ') + ' length must be at least ' + error.details[0].context.limit + ' characters long!';
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes('string.max')) {
          msg = key.replace(/_/g, ' ') + ' length must be less than or equal to ' + error.details[0].context.limit + ' characters long!';
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes('number.min')) {
          msg = key.replace(/_/g, ' ') + 'should be greater than or equal to ' + error.details[0].context.limit;
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes('number.max')) {
          msg = key.replace(/_/g, ' ') + ' should be less than or equal to ' + error.details[0].context.limit;
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes('allowOnly')) {
          msg = 'Password and confirm password must be same!';
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
         }
        else if (error.details[0].type.includes('number.base')) {
          msg = 'Please select any Category !';
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        }
         else {
          msg = 'Please enter a valid ' + key.replace(/_/g, ' ') + '!';
        }
        resolve({
          status: true,
          message: msg
        });
      } else {
        resolve({
          status: false,
          message: ''
        });
      }
    })
  })
};

export const setDeep = (obj, path, value, setrecursively = false) => {
  let level = 0;
  path.reduce((a, b) => {
    level++;
    if (setrecursively && typeof a[b] === "undefined" && level !== path.length) {
      a[b] = {};
      return a[b];
    }
    if (level === path.length) {
      a[b] = value;
      return value;
    } else {
      return a[b];
    }
  }, obj);
  return obj;
}

export const formValueChangeHandler = (e, formValue) => {
  // console.log(e.target, e.target.name, e.target.value, e.target.type, e.target.checked);
  let name = e.target.name;
  const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (name.includes('.')) {
    const path = name.split('.');
    setDeep(formValue, path, value)
  } else if (name.match(/\[(.*?)\]/)) {
    let index = name.match(/\[(.*?)\]/)[1];
    name = name.split('[')[0];
    console.log(name, index);
    formValue[name][index] = value;
  } else {
    formValue[name] = value;
  }
  //console.log(formValue);
  return formValue
};

export const formValueChangeHandlerFoArray = (e, formValue, arrayName, index) => {
  const newFormValue = { ...formValue };
  const newArrayValue = formValueChangeHandler(e, formValue[arrayName][index]);
  newFormValue.attributes[index] = newArrayValue;
  return newFormValue;
};

export const encrypt = (message) => {                            // encrypt message
  let cipherText = crypto.AES.encrypt(message, config.KEY).toString();
  return cipherText;
};

export const decrypt = (cipherText) => {                         // decrypt cipherText
  let message = crypto.AES.decrypt(cipherText, config.KEY).toString(crypto.enc.Utf8);
  return message;
};

export const apiCall = async (method, url, reqData, params, header, loader) => {
  return new Promise((resolve, reject) => {
    if (!loader) {
      store.dispatch({
        type: 'START_LOADER'
      })
    }
    let headers;
    if (header) {
      headers = header;
    } else {
      headers = {
        language: "en",
        web_app_version: "1.0.0",
        auth_token: localStorage.getItem('MFA_AUTH_TOKEN')
      };
    }
    if (localStorage.getItem('MFA_AUTH_TOKEN') !== null) {
      headers.auth_token = localStorage.getItem('MFA_AUTH_TOKEN');
    }
    axios({
      method: method,
      url: config.API_BASE_URL + url,
      data: reqData,
      headers: headers,
      params: params
    })
      .then((response) => {
             console.log("Response....$$$$", response)
        if (!loader) {
          store.dispatch({
            type: 'STOP_LOADER'
          })
        }
        let data = response.data;
        if (data.code === 401) {
          displayLog(data.code, "Session Expired, Please Login Again");
          logOut(false);
        } else if (data.code === 0) {
          displayLog(data.code, data.message);

          // if (url == 'getUserById' || url == 'getServiceById') {
          //   resolve(data)
          // } else {
          //   displayLog(data.code, data.message);
          // }

        } else {
          resolve(data);
        }
      })
      .catch(async (error) => {
        console.log('=================error', error);
        //debugger;
       store.dispatch({
          type: 'STOP_LOADER'
        })
        if (error && error.response && error.response.status === 401) {
          displayLog(0, "Session Expired, Please Login Again");
          logOut(false);
        } else {
          //logOut(false);
        }
        return error;
      })
  })
}

export const displayLog = (code, message) => {
  alertify.dismissAll();
  if (code === 1) {
    Swal.fire({
      text: message,
      customClass: 'swal_success'
    })
  } else if (code === 0) {
    Swal.fire({
      text: message,
      customClass: 'swal_error'
    })
  } else {
    alertify.log(message);
  }
}

export const logOut = (props) => {
  console.log('================logout===============', props);
  if (props) {
    history.push(process.env.PUBLIC_URL + '/login');
  } else {
    history.go(process.env.PUBLIC_URL + '/login')
  }
  localStorage.clear();
}

export const capitalizeFirstLetter = text => {
  text = text.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const lowerCaseWithHypen = text => {
  return text.toLowerCase().replace(/ /g, '_')
}

export const confirmBox = (title, message) => {
  return new Promise((resolve, reject) => {
    let obj = {
      text: message,
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: `Yes`,
    }

    // if (title) obj.title = title
    Swal.fire(obj).then((result) => {
      if (result.isConfirmed) {
        resolve(1)
      } else {
        resolve(0)
      }
    })
  })
}

export const getCode = (codeLength) => {
  var code = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890'

  for (var i = 0; i < codeLength; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return code
}

export const getCurrentTimeStamp = () => {
  const date = new Date()
  return Math.floor(date.getTime() / 1000)
}