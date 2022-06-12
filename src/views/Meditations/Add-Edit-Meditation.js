import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  validateSchema,
  formValueChangeHandler,
  apiCall,
  displayLog,
} from "../../utils/common";
import Joi from "joi-browser";
import moment from "moment";
//import 'react-datetime/css/react-datetime.css';
import { confirmBox } from "../../utils/common";
import defaultimg from "../../assets/images/default.png";

class AddEditCollection extends Component {
  state = {
    form: {
      meditation_name: "",
      categoryId: "",
      subCategoryId: "",
      description: "",
      profile_picture: "",
      mp3Url: "",
      backgroundMusic: "",
    },
    bufferimage: "",
    image_name: "",
    bufferaudio: "",
    audio_name: "",
    bufferBackgroundMusic: "",
    BackgroundMusic_name: "",
    hours: "",
    minutes: "",
    seconds: "",
    dropdownOpen: false,
    categories: [],
    Sub_categories: [],
    error: {
      status: false,
      message: "",
    },
  };

  async componentDidMount() {
    await this.getCategories();
    await this.getMeditationById();
    // console.log("location",this.props.location);
    if (this.props.location.state?.categoryId) {
      await this.getSubCategoryById(this.props.location.state.categoryId);
    }
  }

  getCategories = async () => {
    let response;
    let reqData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
    };
    response = await apiCall("POST", "getAllCateogies", reqData);
    console.log("getAllCateogies", response);

    let categories = response.data.categoies;
    this.setState({ categories: categories });
  };
  async getMeditationById() {
    if (this.props.match.params && this.props.match.params.meditation_id) {
      let req = {
        id: this.props.match.params.meditation_id,
      };
      const response = await apiCall("POST", "getMeditation", req);
      console.log(" getMeditation response is-->>", response);
      let data = response.data;
      let form = this.state.form;
      form["meditation_name"] = data.name;
      form["categoryId"] = data.categoryId;
      form["subCategoryId"] = data.subCategoryId;
      form["description"] = data.description;
      form["profile_picture"] = data.image;
      form["mp3Url"] = data.mp3Url;
      form["backgroundMusic"] = data.backgroundMusic;
      // form['date_of_birth'] = moment(data.date_of_birth).format("YYYY-MM-DD")

      this.setState({ form });
      this.setState({
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds,
      });
    }
  }
  getSubCategoryById = async (id) => {
    console.log("valuueee", id);
    let response;
    let reqData = {
      categoryId: id,
    };
    response = await apiCall("POST", "getSubCategoryById", reqData);
    console.log("getSubCategoryById", response);

    let SubCategories = response.data;
    console.log("getSubCategoryById---", SubCategories);

    this.setState({ Sub_categories: SubCategories });
  };

  submitHandler = async () => {
    var formData = new FormData();
    formData.append("name", this.state.form.meditation_name);
    formData.append("description", this.state.form.description);
    formData.append("categoryId", this.state.form.categoryId);
    formData.append("hours", this.state.hours);
    formData.append("minutes", this.state.minutes);
    formData.append("seconds", this.state.seconds);
    if (this.state.form.subCategoryId) {
      formData.append("subCategoryId", +this.state.form.subCategoryId);
    }
    if (this.state.bufferimage) {
      formData.append("image", this.state.bufferimage, this.state.image_name);
    }
    if (this.state.bufferaudio) {
      formData.append("mp3Url", this.state.bufferaudio, this.state.audio_name);
    }
    if (this.state.bufferBackgroundMusic) {
      formData.append(
        "backgroundMusic",
        this.state.bufferBackgroundMusic,
        this.state.BackgroundMusic_name
      );
    }
    if (this.props.match.params.meditation_id) {
      formData.append("id", this.props.match.params.meditation_id);
    }
    const cloneStateform = (({ subCategoryId, ...o }) => o)(this.state.form);

    console.log("cloneStateform", this.state.form);
    if (this.props.match.params && this.props.match.params.meditation_id) {
      await this.editMeditation(cloneStateform, formData);
    } else {
      await this.addMeditation(cloneStateform, formData);
    }
  };

  editMeditation = async (form, reqData) => {
    let schema = Joi.object().keys({
      meditation_name: Joi.string()
        .trim()
        .max(300)
        .label("Meditation Name")
        .required(),
      categoryId: Joi.number().label("Category").required(),
      description: Joi.string().trim().label("Description").required(),
      profile_picture: Joi.string().strict().trim().label("Image").required(),
      mp3Url: Joi.string().strict().trim().label("Meditation").required(),
      backgroundMusic: Joi.string()
        .strict()
        .trim()
        .label("Background Music")
        .required(),
    });
    this.setState({ error: await validateSchema(form, schema) });
    // if (!this.state.error.status) {
    //   console.log("Validation is Working!", form);
    //   let res = await apiCall("POST", "updateMeditation", reqData);
    //   console.log("updateMeditation Res", res);
    //   if (res.code == 1) {
    //     displayLog(res.code, res.message);
    //     this.props.history.push(process.env.PUBLIC_URL + "/meditations");
    //   }
    // } else {
    //   displayLog(0, this.state.error.message);
    // }
  };

  addMeditation = async (form, reqData) => {
    let schema = Joi.object().keys({
      meditation_name: Joi.string()
        .trim()
        .max(300)
        .label("Meditation Name")
        .required(),
      categoryId: Joi.number().label("Category").required(),
      description: Joi.string().trim().label("Description").required(),
      profile_picture: Joi.string().strict().trim().label("Image").required(),
      mp3Url: Joi.string().strict().trim().label("Meditation").required(),
      backgroundMusic: Joi.string()
        .strict()
        .trim()
        .label("Background Music")
        .required(),
    });
    this.setState({ error: await validateSchema(form, schema) });
    if (!this.state.error.status) {
      let res = await apiCall("POST", "insertMeditation", reqData);
      console.log("insertMeditation Res", res);
      if (res.code == 1) {
        displayLog(res.code, res.message);
        this.props.history.push(process.env.PUBLIC_URL + "/meditations");
      }
    } else {
      displayLog(0, this.state.error.message);
    }
  };

  changeValuesHandler = (e) => {
    let { name, value } = e.target;

    this.setState({ form: formValueChangeHandler(e, this.state.form) }, () => {
      if (name == "categoryId") this.getSubCategoryById(value);
    });
  };

  enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      this.submitHandler();
    }
  };

  loadFile = (event) => {
    let imgsrc = window.URL.createObjectURL(event.target.files[0]);

    let form = this.state.form;
    form["profile_picture"] = imgsrc;
    this.setState({ form: form });
    this.setState({ bufferimage: event.target.files[0] });
    this.setState({ image_name: event.target.files[0].name });
  };

  UploadSong = (e) => {
    let audiosrc = window.URL.createObjectURL(e.target.files[0]);
    let form = this.state.form;
    form["mp3Url"] = audiosrc;
    this.setState({ form });
    this.setState({
      bufferaudio: e.target.files[0],
      audio_name: e.target.files[0].name,
    });
    console.log(this.state);
    setTimeout(() => {
      var seconds = document.getElementById("myAudio").duration;
      var duration = new Date(seconds * 1000).toISOString().substr(11, 8);
      let hours = duration.slice(0, 2);
      let minutes = duration.slice(3, 5);
      let second = duration.slice(6, 8);
      this.setState({
        hours: hours,
        minutes: minutes,
        seconds: second,
      });
    }, 1000);
  };

  RemoveImgHandler = async () => {
    let data = await confirmBox("Delete", "Are you sure you want to Remove?");
    if (data === 1) {
      this.setState({
        form: { ...this.state.form, ["profile_picture"]: "" },
        bufferimage: "",
        image_name: "",
      });
    }
  };
  RemoveaudioHandler = async () => {
    let data = await confirmBox("Delete", "Are you sure you want to Remove?");
    if (data === 1) {
      this.setState({
        form: { ...this.state.form, ["mp3Url"]: "" },
        bufferaudio: "",
        audio_name: "",
      });
    }
  };
  CategoryDropDown = (category, index) => {
    return (
      <option value={+category.id} key={category.id}>
        {category.name}
      </option>
    );
  };
  SubCategoryDropDown = (category, index) => {
    // console.log("gggg", category);
    return (
      <option value={+category.id} key={category.id}>
        {category.sub_categories_name}
      </option>
    );
  };

  //Background Music
  UploadBackgroundMusic = (e) => {
    let audiosrc = window.URL.createObjectURL(e.target.files[0]);
    let form = this.state.form;
    form["backgroundMusic"] = audiosrc;
    this.setState({ form });
    this.setState({
      bufferBackgroundMusic: e.target.files[0],
      BackgroundMusic_name: e.target.files[0].name,
    });
    console.log(this.state);
  };
  RemoveBackgroundMusicHandler = async () => {
    let data = await confirmBox("Delete", "Are you sure you want to Remove?");
    if (data === 1) {
      this.setState({
        form: { ...this.state.form, ["backgroundMusic"]: "" },
        bufferBackgroundMusic: "",
        BackgroundMusic_name: "",
      });
    }
  };

  render() {
    console.log("Meditation state", this.state.form);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>
                  {this.props.match.params &&
                  this.props.match.params.meditation_id
                    ? "Edit Meditation"
                    : "Add Meditation"}
                </h4>
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
                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label className="label-weight">Meditaion Name*</Label>
                      <Input
                        type="text"
                        placeholder={`Enter Meditaion Name`}
                        value={this.state.form["meditation_name"]}
                        // onKeyPress={(e) => this.enterPressed(e)}
                        name="meditation_name"
                        onChange={(e) => this.changeValuesHandler(e)}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Category*</Label>
                      <select
                        value={this.state.form["categoryId"]}
                        name="categoryId"
                        onChange={(e) => this.changeValuesHandler(e)}
                        className="form-control"
                      >
                        <option>Select Category</option>
                        {this.state.categories.map((category, index) =>
                          this.CategoryDropDown(category, index)
                        )}
                      </select>
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Sub Category*</Label>
                      <select
                        value={this.state.form["subCategoryId"]}
                        name="subCategoryId"
                        onChange={(e) => this.changeValuesHandler(e)}
                        className="form-control"
                      >
                        <option>Select Sub Category</option>
                        {this.state.Sub_categories?.map((category, index) =>
                          this.SubCategoryDropDown(category, index)
                        )}
                      </select>
                    </FormGroup>
                  </Col>

                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label className="label-weight">Description*</Label>
                      <Input
                        type="textarea"
                        className="discription"
                        placeholder={`Enter Description`}
                        value={this.state.form["description"]}
                        name="description"
                        onChange={(e) => this.changeValuesHandler(e)}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label className="label-weight" for="avatar">
                        Upload Image*
                      </Label>
                      <div className="uploadPhotoOuter ">
                        {/* <div className="img_div" for="avatar">
                          <img src={this.state.form.profile_picture || defaultimg} className="uploaded_img"  />
                        </div> */}
                        <label for="avatar">
                          <img
                            src={this.state.form.profile_picture || defaultimg}
                            className="uploaded_img"
                          />
                        </label>
                        <input
                          type="file"
                          id="avatar"
                          name="avatar"
                          accept="image/png image/jpeg image/jpg"
                          onChange={this.loadFile}
                          style={{ display: "none" }}
                        />
                        {/* <label className="uploadbtn chatoutbtn btn" for="avatar" style={{ cursor: "pointer" }}>Upload Image</label> */}
                        <button
                          type="button"
                          className="btn text-center font-weight-bold"
                          onClick={this.RemoveImgHandler}
                        >
                          X
                        </button>
                      </div>
                    </FormGroup>
                  </Col>

                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label className="label-weight" for="song">
                        Upload Meditation*
                      </Label>
                      <div className="uploadPhotoOuter d-flex align-items-center">
                        <div className="position-relative">
                          <label for="song" className="m-0">
                            <audio
                              src={this.state.form.mp3Url}
                              id="myAudio"
                              controls
                            />
                          </label>
                          <input
                            type="file"
                            id="song"
                            name="song"
                            className="meditation_audioinput"
                            accept="audio/mp3 "
                            onChange={this.UploadSong}
                            style={
                              this.state.form.mp3Url ? { display: "none" } : {}
                            }
                          />
                          {/* <label className="uploadbtn chatoutbtn btn" for="song" style={{ cursor: "pointer" }}>Upload Meditation</label> */}
                        </div>
                        <button
                          type="button"
                          className="btn text-center font-weight-bold"
                          onClick={this.RemoveaudioHandler}
                        >
                          X
                        </button>
                      </div>
                    </FormGroup>
                  </Col>

                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label className="label-weight" for="song">
                        Upload Background Music*
                      </Label>
                      <div className="uploadPhotoOuter d-flex align-items-center">
                        <div className="position-relative">
                          <label for="song" className="m-0">
                            <audio
                              src={this.state.form.backgroundMusic}
                              id="myAudio"
                              controls
                            />
                          </label>
                          <input
                            type="file"
                            id="song"
                            name="song"
                            className="meditation_audioinput"
                            accept="audio/mp3 "
                            onChange={this.UploadBackgroundMusic}
                            style={
                              this.state.form.backgroundMusic
                                ? { display: "none" }
                                : {}
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="btn text-center font-weight-bold"
                          onClick={this.RemoveBackgroundMusicHandler}
                        >
                          X
                        </button>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <button className="chatoutbtn btn" onClick={this.submitHandler}>
                  Submit
                </button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default AddEditCollection;
