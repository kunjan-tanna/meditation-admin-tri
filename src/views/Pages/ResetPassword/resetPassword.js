import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row, Alert } from 'reactstrap';
import Joi from 'joi-browser';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../../utils/common';
import config from '../../../utils/config';

class ForgotPassword extends Component {
   constructor(props) {
      super(props);
      this.state = {
         form: {
            new_password: '',
            confirm_password: ''
         },
         error: {
            status: false,
            message: ''
         }
      }
   }



   resetPasswordHandler = async () => {
     let schema = Joi.object().keys({
         new_password: Joi.string().trim().min(6).required().label("New password"),
         confirm_password: Joi.string().trim().min(6).required().label("Confirm password").valid(Joi.ref('new_password'))
      })

      this.setState({ error: await validateSchema(this.state.form, schema) });
      if (!this.state.error.status) {
         if (this.props.match.params.resettoken) {
            let data = {
               // old_password: this.state.form.old_password,
               new_password: this.state.form.new_password,
               confirm_new_password: this.state.form.confirm_password,
            }

            let token = this.props.match.params.resettoken;
            let headers = {
               language: "en",
               web_app_version: "1.0.0",
               auth_token: token
            };
           
            const response = await apiCall('POST', 'resetPassword', data, undefined, headers);
            displayLog(response.code, response.message);
            this.props.history.push(process.env.PUBLIC_URL + '/login');

         } else {
            localStorage.removeItem('MFA_AUTH_TOKEN');
         }
      } else {
         displayLog(0, this.state.error.message)
      }
   }

   changeValuesHandler = (e) => {
      this.setState({ form: formValueChangeHandler(e, this.state.form) });
   }
   enterPressed = (event) => {
      var code = event.keyCode || event.which;
      if (code === 13) { //13 is the enter keycode
         this.resetPasswordHandler()
      }
   }
   render() {
      return (
         <div className="app flex-row align-items-center">
            <Container>
               <Row className="justify-content-center">
                  <Col md="6">
                     <CardGroup>
                        <Card className="p-4">
                           <CardBody>
                              <img src={config.APP_ICON} className="APP_ICON text-center mb-3 float-right" ></img>
                              <h1>Reset Password</h1>
                              <p className="text-muted"> Reset your password here </p>
                              {/* {
                                            this.state.error.status ?
                                                <Alert color="danger">
                                                    {this.state.error.message}
                                                </Alert>
                                                : null
                                        } */}
                              <InputGroup className="mb-4">
                                 <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                       <i className="icon-lock"></i>
                                    </InputGroupText>
                                 </InputGroupAddon>
                                 <Input type="password" placeholder="New Password" name="new_password" value={this.state.form.new_password} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                              </InputGroup>
                              <InputGroup className="mb-4">
                                 <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                       <i className="icon-lock"></i>
                                    </InputGroupText>
                                 </InputGroupAddon>
                                 <Input type="password" placeholder="Confirm Password" name="confirm_password" value={this.state.form.confirm_password} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                              </InputGroup>
                              <Row>
                                 <Col xs="12" className="text-left">
                                    <Button color="primary" className="px-4 chatoutbtn" onClick={() => this.resetPasswordHandler()}>Submit</Button>
                                 </Col>
                                 <Col xs="6" className="text-right">
                                    {/* <Button color="link" className="px-0">Forgot password?</Button> */}
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

export default ForgotPassword;
