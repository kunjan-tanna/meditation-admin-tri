import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row, Alert } from 'reactstrap';
import Joi from 'joi-browser';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../../utils/common';
import config from '../../../utils/config';

class Login extends Component {
   constructor(props) {
      super(props);
      this.state = {
         form: {
            email: '',
            password: ''
         },
         error: {
            status: false,
            message: ''
         }
      }
   }

   loginHandler = async () => {
      let schema = Joi.object().keys({
         email: Joi.string().trim().email().required().label("Email"),
         password: Joi.string().trim().min(6).required().label("Password")
      });

      this.setState({ error: await validateSchema(this.state.form, schema) });

      if (!this.state.error.status) {
         let headers = {
            language: "en",
            web_app_version: "1.0.0",
            auth_token: config.DEFAULT_AUTH_TOKEN
         };

         const response = await apiCall('POST', 'signin', this.state.form, undefined, headers);
         if (response.code == 1) {
            await localStorage.setItem('MFA_AUTH_TOKEN', response.data.auth_token);
            await localStorage.setItem('email', response.data.email);
           this.props.history.push(process.env.PUBLIC_URL + '/');
            // displayLog(response.code, response.message);
         } else {
            displayLog(response.code, response.message);
         }
      }
   }

   changeValuesHandler = (e) => {
      this.setState({
         form: {
            ...this.state.form,
            [e.target.name]: e.target.value
         }
      });
   }

   enterPressed = (event) => {
      var code = event.keyCode || event.which;
      if (code === 13) {        //13 is the enter keycode
         this.loginHandler()
      }
   }


   redirectHandler = () => {
      this.props.history.push(process.env.PUBLIC_URL + '/forgot-password');
   }


   render() {
    if (localStorage.getItem('MFA_AUTH_TOKEN')) return <Redirect to={process.env.PUBLIC_URL + '/'} />;

      return (
         <div className="app flex-row align-items-center">
            <Container>
               <Row className="justify-content-center">
                  <Col md="6">
                     <CardGroup>
                        <Card className="p-4">

                           <CardBody>
                           <img src={config.APP_ICON} className="APP_ICON text-center mb-3 float-right" ></img>
                              <h1>Login</h1>
                              <p className="text-muted">Login to your account</p>
                              {
                                 this.state.error.status ?
                                    <Alert color="danger">
                                       {this.state.error.message}
                                    </Alert>
                                    : null
                              }
                              <InputGroup className="mb-3">
                                 <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                       <i className="icon-user"></i>
                                    </InputGroupText>
                                 </InputGroupAddon>
                                 <Input type="text" placeholder="Enter Email" name="email" value={this.state.form.email} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                              </InputGroup>
                              <InputGroup className="mb-4">
                                 <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                       <i className="icon-lock"></i>
                                    </InputGroupText>
                                 </InputGroupAddon>
                                 <Input type="password" placeholder="Enter Password" name="password" value={this.state.form.password} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                              </InputGroup>
                              <Row>
                                 <Col xs="6">
                                    <Button color="primary" className="px-4 chatoutbtn" title="Login" onClick={() => this.loginHandler()}>Login</Button>
                                 </Col>
                                 <Col xs="6" className="text-right">
                                    <Button color="link" className="px-0" title="Forgot password?" onClick={() => this.redirectHandler()}>Forgot password?</Button>
                                 </Col>
                              </Row>
                           </CardBody>
                        </Card>
                     </CardGroup>
                  </Col>
               </Row>
            </Container>
         </div>
      );
   }
}

export default Login;
