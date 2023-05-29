import React, { Component } from 'react'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'

import GlobantLogo from '../../assets/png/logo-globant.png' 
import AssaAbloyLogo from '../../assets/png/logo-assay-abloy.png'
import { UserContext } from '../../UserContext'

import styled from 'styled-components';

const StyledRow = styled(Row)`
  background-color: white;
  height: 70px;
  max-width: 540px;
  align-items:center;
  margin-left: 2px;
  margin-right: 2px;
  border-radius: 8px;
`;

const StyledHeader = styled(Row)`
  display: block;
  margin-bottom: 15px;

  .div {
    text-align:center;
  }

  div:first-child {
    font-weight: bold;
    font-size: 2rem;
  }

  font-weight: light;
  font-size: 1rem;

`;


/**
 * Login page, where users can submit login information. Upon successful login user is shown the Dashboard page.
 */
class Login extends Component {
  constructor () {
    super()
    this.handleInputChange = event => {
      const { name, value } = event.target
      this.setState({ [name]: value })
    }
    this.handleSubmit = event => {
      event.preventDefault()
      if (!this.isFormInValid()) {
        this.context.postUserLogin({
          username: this.state.username,
          password: this.state.password
        });
        this.context.postCognitoLogin({
          username: this.state.username,
          password: this.state.password
        })
      }
    }
    this.state = {
      username: '',
      password: ''
    }
  }

  isFormInValid () {
    if (this.state.username.length < 4 || this.state.password.length < 5) {
      return true
    } else {
      return false
    }
  }

  render () {
    return (
        <Container fluid>
          <div className="bg login_body"></div>
          <div className="bg bg2"></div>
          <div className="bg bg3"></div>
          <div className="content">
            <Row className='justify-content-center'>
              <Col>
                <StyledHeader>
                  <div>Welcome</div>
                  <div>Sign into your account</div>
                </StyledHeader>
                  <Form onSubmit={e => this.handleSubmit(e)}>
                      <Form.Row className='justify-content-center'>
                        <Col xs={10} sm={12}>
                          <Form.Group controlId='loginUsername'>
                            <Form.Label className='font-weight-bold'>Username</Form.Label>
                            <Form.Control
                              size='lg'
                              onChange={this.handleInputChange}
                              value={this.state.username}
                              autoComplete='Username'
                              type='text'
                              name='username'
                            />
                          </Form.Group>
                        </Col>
                      </Form.Row>
                      <Form.Row className='justify-content-center'>
                        <Col xs={10} sm={12}>
                          <Form.Group controlId='loginPassword'>
                            <Form.Label className='font-weight-bold'>Password</Form.Label>
                            <Form.Control
                              size='lg'
                              onChange={this.handleInputChange}
                              value={this.state.password}
                              autoComplete='current-password'
                              type='password'
                              name='password'
                            />
                          </Form.Group>
                        </Col>
                      </Form.Row>
                      <Row className='justify-content-center py-4'>
                        <Col xs={10} sm={12}>
                          <Button
                            disabled={this.isFormInValid()}
                            type='submit'
                            size='block'
                            variant="custom"
                          >
                            Login
                          </Button>
                        </Col>
                      </Row>
                  </Form>
                  <StyledRow className='justify-content-center' >
                    <Col xs={6} md={4}><Image src={GlobantLogo} fluid /></Col>
                    <Col xs={6} md={4}><Image src={AssaAbloyLogo} fluid /></Col>
                  </StyledRow>
              </Col>
            </Row>

          </div>
        </Container>
    )
  }
}

Login.contextType = UserContext

export default Login
