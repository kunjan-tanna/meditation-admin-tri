import React, { Component } from 'react';
import { css } from '@emotion/core';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

// Can be a string as well. Need to ensure each key-value pair ends with ;

class LoaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }
  render() {
    return (
      <div className='sweet-loading'>
        <Loader
          type="TailSpin"
          color="#B8B8F3"
          height={100}
          width={100}
         // timeout={3000} //3 secs
        />
        <br />
      </div>
    )
  }
}

export default LoaderComponent;