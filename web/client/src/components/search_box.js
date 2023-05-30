import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledSearchInput = styled.div`
  display: flex;
  float: right;
  width: 267px;
  height: 42px;
  border-radius: 22px;
  align-items: center;
  border: solid 1px gray;
  background-color: white;
  margin-bottom: 12px;
  opacity: ${props => props.disabled ? '.4' : '1'};

  & span {
    height: auto;
    width: 100%;
    box-shadow: none;
    background: transparent;
    color: black;
    margin-right: 20px;

    & input {
      border: none;
      background-color: transparent;
      width: 100%;
      padding: 12px;
      font-size: 20px;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;

      &:focus,
      &:hover {
        outline: none;
      }
    }
  }
`;

// const StyledIcon = styled.div`
//   margin: 12px 12px 12px 10px;
// `;

// const StyledCloseIcon = styled.div`
//   svg {
//     width: 16px;
//   }
//   margin-right: 12px;
// `;

class SearchBox extends Component {
  constructor(props) {
    super(props);

    this.searchBoxRef = createRef();
    this.searchTimeout = null;

    this.state = {
      searchTerm: '',
    };
  }

  componentWillUnmount() {
    clearTimeout(this.searchTimeout);
  }

  handleChange = event => {
    const { onChange } = this.props;
    const { searchTerm } = this.state;
    const value = event.target.value;

    this.setState({
      [event.target.name]: value
    });

    clearTimeout(this.searchTimeout);
    onChange(searchTerm);
    this.searchTimeout = setTimeout(() => {
      this.searchBoxRef.current.blur();
    }, 2000);
  };

  handleClear = () => {
    const { onChange } = this.props;
    onChange('');
  };

  render() {
    const { searchTerm } = this.state;
    const {
      placeholder,
      'data-testid': data_testid,
      clearable,
      disabled,
      ...props
    } = this.props;
    return (
      <StyledSearchInput {...props} disabled={disabled}>
        {/* <StyledIcon>
          <Icon name={IconList.Search} />
        </StyledIcon> */}
        <span>
          <input
            disabled={disabled}
            value={searchTerm}
            name="searchTerm"
            autoComplete="off"
            onChange={this.handleChange}
            placeholder={placeholder}
            data-testid={`searchbox-input-${data_testid}`}
            ref={this.searchBoxRef}
          />
        </span>
        {/* {clearable && (
          <StyledCloseIcon
            data-testid={`searchbox-input-${data_testid}-clear`}
            onClick={this.handleClear}
          >
            <Icon name={IconList.Close} />
          </StyledCloseIcon>
        )} */}
      </StyledSearchInput>
    );
  }
}

SearchBox.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  'data-testid': PropTypes.string,
  clearable: PropTypes.bool,
  disabled: PropTypes.bool
};

SearchBox.defaultProps = {
  'data-testid': '',
  clearable: false,
  disabled: false
};

export default SearchBox;
