import React, { Component } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Col, Row, FormGroup, Input, Label } from 'reactstrap';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../utils/common';
import Joi from 'joi-browser';
import { withRouter } from 'react-router-dom';
import { confirmBox } from '../../utils/common';
import defaultimg from "../../assets/images/default.png";


class AddEditCollection extends Component {
  state = {
    form: {
      category_name: '',
      profile_picture: '',
    },
    buffer: "",
    image_name: "",
    error: {
      status: false,
      message: '',
    },
  }

  async componentDidMount() {
    await this.getCategoryById()
  }

  async getCategoryById() {
    if (this.props.match.params && this.props.match.params.category_id) {
      let req = {
        id: this.props.match.params.category_id
      }
      const response = await apiCall('POST', 'getCategory', req);
      console.log('getCategory response is-->>', response);
      let data = response.data
      let form = this.state.form;
      form['category_name'] = data.name
      form['profile_picture'] = data.image

      this.setState({ form })
    }
  }

  submitHandler = async () => {
    var formData = new FormData();
    formData.append('name', this.state.form.category_name);

    if (this.state.buffer) {
      formData.append('image', this.state.buffer, this.state.image_name);
    }
    if (this.props.match.params.category_id) {
      formData.append('id', this.props.match.params.category_id);
    }
    if (this.props.match.params && this.props.match.params.category_id) {
      await this.editCategory(this.state.form, formData)
    }
    else {
      await this.addCategory(this.state.form, formData)
    }

  }

  editCategory = async (form, reqData) => {
    let schema = Joi.object().keys({
      category_name: Joi.string().trim().max(300).label('Category Name').required(),
      profile_picture: Joi.string().label('Image').required(),
    })
    this.setState({ error: await validateSchema(form, schema) });
    if (!this.state.error.status) {
      let res = await apiCall('POST', 'updateCateogy', reqData);
      console.log("updateCateogy Res", res)
      if (res.code == 1) {
        displayLog(res.code, res.message)
        this.props.history.push(process.env.PUBLIC_URL + '/categories');
      }
    }
    else {
      displayLog(0, this.state.error.message)
    }
  }

  addCategory = async (form, reqData) => {
    let schema = Joi.object().keys({
      category_name: Joi.string().trim().max(300).label('Category Name').required(),
      profile_picture: Joi.string().label('Image').required(),
    })
    this.setState({ error: await validateSchema(form, schema) });
    if (!this.state.error.status) {
      let res = await apiCall('POST', 'insertCateogy', reqData);
      console.log("insertCateogies", res)
      if (res.code == 1) {
        displayLog(res.code, res.message)
        this.props.history.push(process.env.PUBLIC_URL + '/categories');
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
      this.submitHandler()
    }
  }

  loadFile = (event) => {
    let imgsrc = window.URL.createObjectURL(event.target.files[0]);

    this.setState({ fileError: "" })
    let form = this.state.form;
    form["profile_picture"] = imgsrc;
    this.setState({ form: form })
    this.setState({ buffer: event.target.files[0] })
    this.setState({ image_name: event.target.files[0].name })
  }
  RemoveImgHandler = async () => {
    let data = await confirmBox('Delete', 'Are you sure you want to Delete?');
    if (data === 1) {
      this.setState({
        form: { ...this.state.form, ["profile_picture"]: "" },
        buffer: "",
        image_name: "",
      })
      this.setState({ showremove: !this.state.showremove })
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>{this.props.match.params && this.props.match.params.category_id ? "Edit Category" : "Add Category"}</h4>
              </CardHeader>
              <CardBody>
                {/* {
                  this.state.error.status ?
                    <Alert color="danger">
                      {this.state.error.message}
                    </Alert>
                    : null
                } */}
                <Row>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Category Name*</Label>
                      <Input type="text" placeholder={`Enter Category Name`}
                        value={this.state.form['category_name']}
                        // onKeyPress={(e) => this.enterPressed(e)}
                        name="category_name" onChange={(e) => this.changeValuesHandler(e)} />
                    </FormGroup>
                  </Col>



                </Row>

                <Row>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight" for="avatar">Upload Category Image*</Label>
                      <div className="uploadPhotoOuter d-flex  align-items-center">
                        <label for="avatar">
                          <img src={this.state.form.profile_picture || defaultimg} className="uploaded_img" />
                        </label>
                        <input type="file" id="avatar" name="avatar"
                          accept="image/png image/jpeg image/jpg " onChange={this.loadFile} style={{ display: "none" }} />
                        {/* <label className="chatoutbtn btn" for="avatar" style={{ cursor: "pointer" }}>Upload Image</label> */}
                        <button type="button" className="btn text-center font-weight-bold" onClick={this.RemoveImgHandler}>X</button>
                      </div>
                    </FormGroup>
                  </Col>


                </Row>



              </CardBody>
              <CardFooter>
                <button className="chatoutbtn btn" onClick={this.submitHandler} >Submit</button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div >
    )
  }
}

export default withRouter(AddEditCollection);
