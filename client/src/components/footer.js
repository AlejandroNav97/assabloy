import React, { Component } from 'react';
import api from '../utils/api';
import styled from 'styled-components';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const StyledFooter = styled.div`
  padding: 8px;
  background-image: linear-gradient(-30deg,#8FBF38 30%,#00A0D0 66%);
  bottom:0;
  left:-50%;
  opacity:.7;
  right:-50%;
  top:0;
  z-index:-1;

  span:first-child {
    font-weight: bold;
    color: white; 
    font-size: x-large;
  }

  span {
    font-weight: lighter;
    color: white;
  }

  .column {
    display: inline-grid;
    align-items: center;
    justify-content: center;
    text-align: left;
  } 
`;

class Footer extends Component {
  state = {
    hotelInfo: [
      {
        hotel_name: '',
        address: '',
        email: '',
        phone: '',
        city: ''
      }
    ]
  } 

  async componentDidMount() {
    try {
      await api.getHotelInfo(1).then(hotelData => this.setState({ hotelInfo: hotelData })); 
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const info  = this.state.hotelInfo[0];
    return (
          <StyledFooter>
              <Row  md={3} >
                <Col className="column">
                  <span>{info.hotel_name}</span>
                  <span>{info.address}<br></br>{info.city}</span>
                </Col>
                <Col className="column">
                  <span>Contact us</span>
                  <span>E-mail: {info.email}</span>
                  <span>Phone: {info.phone}</span>
                </Col>
              </Row>
          </StyledFooter>
    )
  }
}

export default Footer
