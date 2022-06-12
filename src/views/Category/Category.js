import React, { Component } from "react";
import { Card, CardBody, CardHeader, Col, Row, Table, Input } from "reactstrap";
import { apiCall, displayLog, confirmBox } from "../../utils/common";
import ReactPaginate from "react-paginate";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";

import { connect } from "react-redux";
import * as actions from "../../store/actions";
import { withRouter } from "react-router-dom";

import { Switch } from "@material-ui/core";

class Users extends Component {
  state = {
    users: [],
    categories: [],
    page_no: 1,
    limit: 15,
    search: "",
    total_categories: "",
    user_id: null,
    order_by: "DESC",
    sort_by: "created_date",
    sort_type: 1,
  };

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  async componentDidMount() {
    //	await this.checkLocalStrage();
    await this.getCategories();
  }

  // checkLocalStrage = async () => {

  // 	if (localStorage.getItem('UserFilters') !== null) {
  // 		let data = JSON.parse(localStorage.getItem('UserFilters'));
  // 		localStorage.removeItem('UserFilters');
  // 		await this.setState({ ...data })
  // 	}

  // }

  handlePageClick = (e) => {
    this.setState({ page_no: e.selected + 1 }, () => {
      this.getCategories();
    });
  };

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName("main")[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      console.log("header bottom reached");
      this.getCategories();
    }
  };

  getCategories = async () => {
    let response;
    let reqData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      //	order_by: this.state.order_by,
      //	sort_by: this.state.sort_by,
    };
    if (this.state.search) {
      // reqData["query_string"] = this.state.search.replace(/\s+/g, '');
      reqData["query_string"] = this.state.search;
    }
    response = await apiCall("POST", "getAllCateogies", reqData);
    console.log("getAllCateogies", response);

    let categories = response.data.categoies;
    console.log("categories", categories);
    this.setState({
      categories: categories,
      total_categories: response.data.total_categories,
    });
  };

  addCategory = () => {
    this.props.history.push(process.env.PUBLIC_URL + "/categories/addcategory");
  };

  changeSearch = (e) => {
    let text = String(e.target.value);
    this.setState({ search: text });
  };

  enterPressed = async (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      await this.setState({ page_no: 1 });
      this.search();
    }
  };

  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getCategories();
    });
  };

  // SortingHandler = (sort_by) => {
  // 	if (this.state.sort_type === 0) {
  // 		this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () => this.getCategories())
  // 	} else {
  // 		this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () => this.getCategories())

  // 	}
  // }

  search() {
    this.setState({ users: [], page_no: 1 }, () => this.getCategories());
  }

  // handleCheckbox = (e, id) => {
  // 	if (e.target.checked) {
  // 		this.state.selected.push(

  // 		);
  // 	}
  // }

  delete = async (category) => {
    let title = "Delete Category";
    // let message = `Delete ${category.name} ? Meditations will be deleted from this category too.`
    let message = [
      `Delete ${category.name} ? `,
      ` Meditations will be deleted from this category too.`,
    ].join("");
    if (await confirmBox(title, message)) {
      let reqData = {
        id: category.id,
      };

      let response = await apiCall("POST", "deleteCateogy", reqData);

      if (response && response.code === 1) {
        await displayLog(1, `${category.name} has been successfully removed.`);
        console.log("User deleted!", response);
        this.getCategories();
      }
    }
  };

  editCategory = async (category) => {
    let filterData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      userType: this.state.userType,
      order_by: this.state.order_by,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      search: this.state.search,
    };
    //localStorage.setItem('UserFilters', JSON.stringify(filterData))
    this.props.history.push(
      process.env.PUBLIC_URL + `/categories/edit/${category.id}`
    );
  };

  CategoryRow = (category, index) => {
    return (
      <tr key={index}>
        <td className="text-center align-middle">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-center align-middle">{category.name}</td>
        <td className="text-center align-middle">
          {moment(category.createdAt * 1000).format("DD MMM, YYYY")}
        </td>
        <td className="text-center align-middle">
          {moment(category.modifiedAt * 1000).format("DD MMM, YYYY")}
        </td>
        <td className="text-center align-middle">
          {category.totalMeditations}
        </td>
        <td className="text-center align-middle">
          <span
            className="fa fa-edit mx-2"
            title="Edit User"
            onClick={() => this.editCategory(category)}
          ></span>
          <span
            className="fa fa-trash mx-2"
            title="Delete user"
            onClick={() => this.delete(category)}
          ></span>
        </td>
      </tr>
    );
  };

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>Categories</h4>
                <button
                  className="chatoutbtn btn float-right"
                  onClick={() => this.addCategory()}
                >
                  Add New Category
                </button>
              </CardHeader>
              <CardBody className="pb-0">
                <Row className="align-items-right d-flex">
                  <Col sm="6" md="2" className="mb-xl-0">
                    <Input
                      className="limit"
                      type="select"
                      name="limit"
                      value={this.state.limit}
                      onChange={(e) => this.changeLimit(e)}
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      {/* <option value={100}>100</option> */}
                    </Input>
                  </Col>

                  <Col
                    sm="6"
                    md="10"
                    xs
                    className="mb-xl-0 float-right justify-content-end d-flex"
                  >
                    <Input
                      type="text"
                      placeholder={`Search by Category name`}
                      className="search"
                      value={this.state.search}
                      name="search"
                      onChange={(e) => this.changeSearch(e)}
                      onKeyPress={(e) => this.enterPressed(e)}
                      //   onKeyDown={() => this.search()}
                    />

                    <button
                      className="chatoutbtn btn ml-3"
                      onClick={() => this.search()}
                    >
                      Search
                    </button>
                  </Col>

                  {/* <Col>
										<button className="chatoutbtn btn float-right justify-content-end" onClick={() => this.addUser()}>Add</button>
									</Col> */}
                </Row>
              </CardBody>

              <CardBody className="Tablescroll">
                <Table bordered striped size="sm" className="CategoryTable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center align-middle">
                        No
                      </th>
                      <th scope="col" className="text-center align-middle">
                        Category Name
                      </th>
                      <th scope="col" className="text-center align-middle">
                        Created Date
                      </th>
                      <th scope="col" className="text-center align-middle">
                        Last Modified Date
                      </th>
                      <th scope="col" className="text-center align-middle">
                        Total Meditations
                      </th>
                      <th
                        scope="col"
                        colSpan="3"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  {this.state.categories.length > 0 ? (
                    <tbody>
                      {this.state.categories.map((category, index) =>
                        this.CategoryRow(category, index)
                      )}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr className="text-center">
                        <td colSpan={10} className="nodatafound">
                          {" "}
                          {this.props.loading
                            ? "Loading..."
                            : "No Data Found"}{" "}
                        </td>
                      </tr>
                    </tbody>
                  )}
                </Table>
              </CardBody>
            </Card>
            <Row>
              <Col>
                <ReactPaginate
                  pageCount={Math.ceil(
                    this.state.total_categories / this.state.limit
                  )}
                  onPageChange={this.handlePageClick}
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  breakClassName={"page-item"}
                  breakLinkClassName={"page-link"}
                  containerClassName={"pagination justify-content-end"}
                  pageClassName={"page-item"}
                  pageLinkClassName={"page-link"}
                  previousClassName={"page-item"}
                  previousLinkClassName={"page-link"}
                  nextClassName={"page-item"}
                  nextLinkClassName={"page-link"}
                  activeClassName={"active"}
                  forcePage={this.state.page_no - 1}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.reducer.loading,
    config: state.reducer.config,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getConfig: (data) => dispatch(actions.getConfig()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Users));
