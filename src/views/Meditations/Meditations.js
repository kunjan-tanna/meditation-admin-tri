import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Input } from 'reactstrap';
import { apiCall, displayLog, confirmBox } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";

import { connect } from 'react-redux';
import * as actions from '../../store/actions'
import { withRouter } from 'react-router-dom';

import { Switch } from '@material-ui/core';

class Meditations extends Component {
	state = {
		meditations: [],
		categories: [],
		categoryId: "",
		time: "",
		page_no: 1,
		limit: 15,
		search: '',
		total_meditations: '',
		user_id: null,
		order_by: "DESC",
		sort_by: "created_date",
		sort_type: 1,
	}

	isBottom(el) {
		return el.getBoundingClientRect().bottom <= window.innerHeight;
	}

	async componentDidMount() {
		//	await this.checkLocalStrage();
		await this.getMeditations();
		await this.getCategories();
	}

	checkLocalStrage = async () => {

		if (localStorage.getItem('UserFilters') !== null) {
			let data = JSON.parse(localStorage.getItem('UserFilters'));
			localStorage.removeItem('UserFilters');
			await this.setState({ ...data })
		}

	}

	handlePageClick = (e) => {
		this.setState({ page_no: e.selected + 1 }, () => {
			this.getMeditations();
		});
	}

	trackScrolling = () => {
		const wrappedElement = document.getElementsByClassName('main')[0];
		if (this.isBottom(wrappedElement)) {
			document.removeEventListener('scroll', this.trackScrolling);
			console.log('header bottom reached');
			this.getMeditations();
		}
	};

	getMeditations = async () => {
		let response;
		let reqData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
			//order_by: this.state.order_by,
			//sort_by: this.state.sort_by,
		};
		if (this.state.search) {
			reqData["query_string"] = this.state.search;
		}
		if (this.state.time) {
			reqData["time"] = this.state.time;
		}
		response = await apiCall('POST', 'getAllMeditations', reqData);
		console.log("getAllMeditations Res", response)
		let meditations = response.data.meditations;
		this.setState({ meditations: meditations, total_meditations: response.data.total_meditations });
	}

	getMeditationByCategory = async () => {
		let response;
		let reqData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
		};
		if (this.state.search) {
			reqData["query_string"] = this.state.search.replace(/\s+/g, '');
		}
		if (this.state.categoryId) {
			reqData["categoryId"] = this.state.categoryId
		}
		response = await apiCall('POST', 'getMeditationByCategory', reqData);
		console.log("getMeditationByCategory Res", response)
		let meditations = response.data.meditations;
		this.setState({ meditations: meditations, total_meditations: response.data.total_meditations });
	}

	getCategories = async () => {
		let response;
		let reqData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
			//	order_by: this.state.order_by,
			//	sort_by: this.state.sort_by,
		};
		if (this.state.search) {
			reqData["query_string"] = this.state.search.replace(/\s+/g, '');
		}
		response = await apiCall('POST', 'getAllCateogies', reqData);
		console.log("getAllCateogies", response)

		let categories = response.data.categoies;
		this.setState({ categories: categories });
	}


	addMeditation = () => {
		this.props.history.push(process.env.PUBLIC_URL + '/meditations/addmeditation');
	}

	clearFilters = async () => {
		await this.setState({
			page_no: 1,
			limit: 15,
			userType: '',
			order_by: "DESC",
			sort_by: "created_date",
			sort_type: 1,
			startDate: '',
			endDate: '',
			search: ''
		})
		this.getMeditations();
	}

	changeSearch = (e) => {
		let text = String(e.target.value);
		this.setState({ search: text })
	}

	enterPressed = async (event) => {
		var code = event.keyCode || event.which;
		if (code === 13) { //13 is the enter keycode
			await this.setState({ page_no: 1 })
			this.search()
		}
	}

	changeLimit = (e) => {
		this.setState({ limit: +e.target.value, page_no: 1 }, () => {
			this.getMeditations();
		});
	}
	changeCategory = (e) => {
		this.setState({ categoryId: +e.target.value, page_no: 1 }, () => {
			if (this.state.categoryId) {
				this.getMeditationByCategory();
			} else {
				this.getMeditations();
			}
		});
	}
	changeTime = (e) => {
		this.setState({ time: e.target.value, page_no: 1 }, () => {
			this.getMeditations();
		});
	}
	changeFilter = (e) => {
		this.setState({ userType: +e.target.value, page_no: 1 }, () => {
			this.getMeditations();
		});
	}

	SortingHandler = (sort_by) => {
		if (this.state.sort_type === 0) {
			this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () => this.getMeditations())
		} else {
			this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () => this.getMeditations())

		}
	}

	search() {
		this.setState({ meditations: [], page_no: 1 }, () => this.getMeditations());
	}

	handleCheckbox = (e, id) => {
		if (e.target.checked) {
			this.state.selected.push(

			);
		}
	}

	delete = async (meditation) => {
		let title = "Delete Meditation"
		let message = `Delete ${meditation.name}? `
		if (await confirmBox(title, message)) {

			let reqData = {
				id: meditation.id
			}

			let response = await apiCall('POST', 'deleteMeditation', reqData);

			if (response && response.code === 1) {
				await displayLog(1, `${meditation.name} has been successfully removed.`);
				console.log("meditation deleted!", response);
				this.getMeditations();
			}
		}
	}

	editUser = async (meditation) => {
		let filterData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
			userType: this.state.userType,
			order_by: this.state.order_by,
			sort_by: this.state.sort_by,
			sort_type: this.state.sort_type,
			search: this.state.search
		}
		localStorage.setItem('UserFilters', JSON.stringify(filterData))
		this.props.history.push({
			pathname: process.env.PUBLIC_URL + `/meditations/edit/${meditation.id}`,
			state: { categoryId: meditation.categoryId }
		}
		)
	}

	view = (user) => {
		let filterData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
			userType: this.state.userType,
			order_by: this.state.order_by,
			sort_by: this.state.sort_by,
			sort_type: this.state.sort_type,
			search: this.state.search
		}
		localStorage.setItem('UserFilters', JSON.stringify(filterData))
		this.props.history.push(process.env.PUBLIC_URL + '/users/' + user.user_id, filterData);

	}



	MeditationRow = (meditation, index) => {
		return (
			< tr key={index} >
				<td className="text-center align-middle">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
				<td className="text-center align-middle" title={meditation.name}>{meditation.name}</td>
				<td className="text-center align-middle" title={meditation.description}>{meditation.description}</td>
				<td className="text-center align-middle">
					{meditation.hours ? `${meditation.hours < 10 ? "0" + meditation.hours : meditation.hours}:` : "00:"}
					{meditation.minutes ? `${meditation.minutes < 10 ? "0" + meditation.minutes : meditation.minutes}:` : "00:"}
					{meditation.seconds ? `${meditation.seconds < 10 ? "0" + meditation.seconds : meditation.seconds}` : "00"}</td>

				<td className="text-center align-middle">{moment(meditation.createdAt * 1000).format('DD MMM, YYYY')}</td>
				<td className="text-center align-middle">{moment(meditation.modifiedAt * 1000).format('DD MMM, YYYY')}</td>

				<td className="text-center align-middle">
					<span className="fa fa-edit mx-2" title="Edit User" onClick={() => this.editUser(meditation)}></span>
					{/* <span className="fa fa-info-circle" title="View user" onClick={() => this.view(user)}></span> */}
					<span className="fa fa-trash mx-2" title="Delete user" onClick={() => this.delete(meditation)}></span>
				</td>
			</tr >
		)
	}

	CategoryDropDown = (category, index) => {
		return (
			<option value={+category.id} key={category.id}>{category.name}</option>
		)
	}

	render() {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col xl={12}>
						<Card>
							<CardHeader>
								<h4>Meditations</h4>
								<button className="chatoutbtn btn float-right" onClick={() => this.addMeditation()}>Add New Meditation</button>
							</CardHeader>
							<CardBody className="pb-0">
								<Row className="align-items-right d-flex">
									<Col sm="6" md="2" className="mb-xl-0">
										<Input className="limit" type="select" name="limit" value={this.state.limit} onChange={(e) => this.changeLimit(e)} >
											<option value={15}>15</option>
											<option value={30}>30</option>
											<option value={50}>50</option>
											{/* <option value={100}>100</option> */}
										</Input>
									</Col>

									<Col sm="6" md="2" className="mb-xl-0">
										<Input className="limit" type="select" name="limit" value={this.state.categoryId || "By Category"} onChange={(e) => this.changeCategory(e)} >
											<option value="">By Category</option>
											{this.state.categories.map((category, index) =>
												this.CategoryDropDown(category, index)
											)}
										</Input>
									</Col>

									<Col sm="6" md="2" className="mb-xl-0">
										<Input className="limit" type="select" name="limit" value={this.state.time || "By Time"} onChange={(e) => this.changeTime(e)} >
											<option value="">By Time</option>
											<option value={"5"}>0-5mins</option>
											<option value={"10"}>5-10mins</option>
											<option value={"10+"}>10+ mins</option>
										</Input>
									</Col>

									<Col sm="6" md="6" xs className="mb-xl-0 float-right justify-content-end d-flex">
										<Input type="text" placeholder={`Search by Meditation name`}
											className="search"
											value={this.state.search}
											name="search" onChange={(e) => this.changeSearch(e)}
											onKeyPress={(e) => this.enterPressed(e)} />
										<button className="chatoutbtn btn ml-3" onClick={() => this.search()}>Search</button>
									</Col>

									{/* <Col>
										<button className="chatoutbtn btn float-right justify-content-end" onClick={() => this.addUser()}>Add</button>
									</Col> */}

								</Row>
							</CardBody>

							<CardBody className="Tablescroll">
								<Table bordered striped size="sm" className="MeditationTable ">
									<thead>
										<tr>
											<th scope="col" className="text-center align-middle">No</th>
											<th scope="col" className="text-center align-middle">Meditation Name</th>
											<th scope="col" className="text-center align-middle">Description</th>
											<th scope="col" className="text-center align-middle">Duration</th>
											<th scope="col" className="text-center align-middle">Created Date</th>
											<th scope="col" className="text-center align-middle">Last Modified Date</th>
											<th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th>
										</tr>
									</thead>
									{
										this.state.meditations.length > 0 ?
											<tbody>
												{this.state.meditations.map((meditation, index) =>
													this.MeditationRow(meditation, index)
												)}
											</tbody>
											:
											<tbody>
												<tr className="text-center "><td colSpan={10} className="nodatafound"> {this.props.loading ? "Loading..." : "No Data Found"} </td></tr>
											</tbody>
									}
								</Table>
							</CardBody>
						</Card>
						<Row>
							<Col>
								<ReactPaginate
									pageCount={Math.ceil(this.state.total_meditations / this.state.limit)}
									onPageChange={this.handlePageClick}
									previousLabel={'Previous'}
									nextLabel={'Next'}
									breakLabel={'...'}
									breakClassName={'page-item'}
									breakLinkClassName={'page-link'}
									containerClassName={'pagination justify-content-end'}
									pageClassName={'page-item'}
									pageLinkClassName={'page-link'}
									previousClassName={'page-item'}
									previousLinkClassName={'page-link'}
									nextClassName={'page-item'}
									nextLinkClassName={'page-link'}
									activeClassName={'active'}
									forcePage={this.state.page_no - 1}
								/>
							</Col>
						</Row>
					</Col>
				</Row>
			</div >
		)
	}
}

const mapStateToProps = state => {
	return {
		loading: state.reducer.loading,
		config: state.reducer.config
	}
}

const mapDispatchToProps = dispatch => {
	return {
		getConfig: (data) => dispatch(actions.getConfig())
	};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Meditations));