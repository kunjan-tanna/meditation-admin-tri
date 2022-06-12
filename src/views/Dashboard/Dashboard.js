import React, { Component } from 'react';
import { Card, CardHeader, Col, Row, CardBody, CardFooter } from 'reactstrap';

import { apiCall } from '../../utils/common';

import './dashboard.css';

class Dashboard extends Component {

    state = {
        page_no: 1,
		limit: 15,
        total_meditations: '...',
        total_categories:'...',
    }

    async componentDidMount() {
        await this.getMeditations()
        await this.getCategories()
    }

    getMeditations = async () => {
		let response;
		let reqData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
		};
		response = await apiCall('POST', 'getAllMeditations', reqData);
		console.log("getmeditation Res", response)
		let meditations = response.data.meditations;
		this.setState({total_meditations: response.data.total_meditations });
    }
    getCategories = async () => {
		let response;
		let reqData = {
			page_no: this.state.page_no,
			limit: this.state.limit,
		};
		response = await apiCall('POST', 'getAllCateogies', reqData);
		console.log("getAllCateogies", response)

		let categories = response.data.categoies;
		this.setState({ total_categories: response.data.total_categories });
	}

    render() {
        return (
            <div>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4 className="card-header-custom">Dashboard</h4>
                            </CardHeader>


                            <CardBody className="d-flex justify-content-around">

                                <Card className="dashboard_count">
                                    <CardHeader className="">
                                        <h1 className="purple text-center">{this.state.total_categories}</h1>
                                        <h4 className="dashboardh4">Total Categories</h4>
                                        
                                    </CardHeader>
                                </Card>

                                
                                <Card className="dashboard_count">
                                    <CardHeader className="">
                                        <h1 className="purple text-center">{this.state.total_meditations}</h1>
                                        <h4 className="dashboardh4">Total Meditations </h4>
                                        
                                    </CardHeader>
                                </Card>

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div >
        );
    }
}

export default Dashboard;