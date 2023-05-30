import React, { Component } from 'react';
import { UserContext } from '../UserContext';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

const StyledTopBar = styled.div`
  background-image: linear-gradient(-30deg,#00A0D0 30%,#8FBF38 66%);
  bottom:0;
  left:-50%;
  opacity:.7;
  right:-50%;
  top:0;
  z-index:-1;

  align-items: center;
  display: flex; 
  justify-content: space-between;
  padding: 0 0px 0 30px;

  span {
    font-weight: bold;
    color: white;
    letter-spacing: 0.05rem;
    font-size: x-large;
  }
`;

const StyledButton = styled(Button)`
  width: 50px;
  height: 50px;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  padding: 0;
  font-size: 1.25rem;
  line-height: 0;
  border-radius: 0;
`;

class UserNavigationCard extends Component {
  render() {
    return (
      <UserContext.Consumer>
        {({ user, getUserLogout }) => (
          <StyledTopBar>
              <span>Welcome {user.username} !</span>
              <StyledButton
                onClick={getUserLogout}
                size='lg'
                block
                variant='dark'
              >
                &nbsp;<i className='fa fa-sign-out-alt'></i>
              </StyledButton>
          </StyledTopBar>
        )}
      </UserContext.Consumer>
    )
  }
}

export default UserNavigationCard
