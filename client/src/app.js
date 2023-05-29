import React from 'react'
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import { UserContext, user } from './UserContext'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import styled from 'styled-components';

import { PrivateAccessRoute } from './components/private_access_route'
import UserNavigationCard from './components/user_navigation_card'
import Footer from './components/footer'

// Import pages
import Login from './pages/login'
import Dashboard from './pages/dashboard'

// Import API
import authapi from './utils/authapi'

const StyledFooterContainer = styled(Row)`
  position: fixed;
  width: 100%;
  bottom: 0px;
`;

const StyledContainer = styled(Container)`
    padding-right: 0px !important;
    padding-left: 0px !important;
  
    .row {
      margin-right: 0px;
      margin-left: 0px;
    }

    .top-bar {
      position: fixed;
      width: 100%;
      top: 0px
    }

    .dashboard-content {
      margin-top: 50px;
    }

    .card-body {
      padding: 0.5rem;
    }

`;
class App extends React.Component {
  constructor() {
    super()
    this.getUserStatus = () => {
      authapi.getLoginStatus().then(res => {
        if (res) {
          this.setState(() => ({ user: res.user }))
        }
      })
    };
    this.postUserLogin = userData => {
      if (userData) {
        authapi.postUserLogin(userData, (err, res) => {
          if (err === true) {
            return console.log('Failed to log in')
          }
          this.setState({ user: res.user })
        })
      }
    }
    this.postCognitoLogin = userData => {
      if (userData) {
        authapi.postCognitoLogin( null, (err, res) => {
          if (err === true) {
            this.setState( { user: { ...user, access_id: 0 } });
            return console.log('Failed to log in')
          }
        })
      }
    }
    this.getUserLogout = event => {
      event.preventDefault()
      authapi.getLoggedOut().then(this.getUserStatus)
    }
    this.state = {
      user: user,
      getUserStatus: this.getUserStatus,
      postUserLogin: this.postUserLogin,
      postCognitoLogin: this.postCognitoLogin,
      getUserLogout: this.getUserLogout,
    }
  }
  componentDidMount() {
    if (this.state.user.access_id === 0) {
      this.state.getUserStatus()
    }
  }
  render() {
    const { user } = this.state
    return (
      <UserContext.Provider value={this.state}>
        <Router>
          {user.access_id === 0 ? (
            <>
              <Redirect to={'/'} />
              <Login />
            </>
          ) : (
            <StyledContainer fluid >
              <Row className="top-bar">
                <Col className="px-0"> 
                <UserNavigationCard />
                </Col>
              </Row>
              <Row className="dashboard-content">
                <Col className='m-0 pt-2 p-2'>
                  <Switch>
                    <PrivateAccessRoute
                      exact
                      strict
                      path='/'
                      component={Dashboard}
                      accessId='1'
                    />
                  </Switch>
                </Col>
              </Row>
              <StyledFooterContainer>
                <Col className="px-0"> 
                  <Footer/>
                </Col>
              </StyledFooterContainer>
            </StyledContainer>
          )}
        </Router>
      </UserContext.Provider>
    )
  }
}

export default App
