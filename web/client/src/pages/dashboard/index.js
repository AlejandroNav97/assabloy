import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';
import styled from "styled-components";
import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import addDays from "date-fns/addDays";
import { parseISO, format, isBefore, getTime } from 'date-fns'
import Table from 'react-bootstrap/Table'
import "react-datepicker/dist/react-datepicker.css";

import api from "../../utils/api";
import authapi from '../../utils/authapi'

import SearchBox from "../../components/search_box";

const StyledDatepicker = styled.div`

  .react-datepicker-wrapper{
    width: 100%;
    margin-bottom: 1rem;
  }
  

  .react-datepicker {
    border-color: transparent;
  }

  .react-datepicker__day-names {
    margin-top: 2px;
  }

  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    color: white;
    background-color: #17a2b8;
  }

  .react-datepicker__portal .react-datepicker__day-name,
  .react-datepicker__portal .react-datepicker__day,
  .react-datepicker__portal .react-datepicker__time-name {
    width: 2rem;
    line-height: 1.5rem;
  }

  .react-datepicker__portal .react-datepicker__current-month,
  .react-datepicker__portal .react-datepicker-time__header {
    font-size: 1rem;
  }

  .react-datepicker__navigation--next {
    width: 16px;
    height: 16px;
    border-top: 5px solid #17a2b8;
    border-right: 5px solid #17a2b8;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    margin: 3px;
    border-left-color: transparent;
  }

  .react-datepicker__navigation--next--disabled,
  .react-datepicker__navigation--next:hover,
  .react-datepicker__navigation--next--disabled:hover,
  .react-datepicker__navigation--next:focus {
    border-left-color: transparent;
    outline: none;
  }

  .react-datepicker__navigation--previous {
    width: 16px;
    height: 16px;
    border-top: 5px solid #17a2b8;
    border-right: 5px solid #17a2b8;
    -webkit-transform: rotate(220deg);
    -ms-transform: rotate(220deg);
    transform: rotate(220deg);
    margin: 3px;
    border-left-color: transparent;
  }

  .react-datepicker__navigation--previous--disabled,
  .react-datepicker__navigation--previous:hover,
  .react-datepicker__navigation--previous--disabled:hover,
  .react-datepicker__navigation--previous:focus {
    outline: none;
    border-right-color: #17a2b8;
  }

  .react-datepicker__day--outside-month {
    visibility: hidden;
  }

  .react-datepicker__day--disabled {
    color: gray;
  }
  .react-datepicker__input-container input {
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
`;

const StyledInput = styled.div`
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

const StyledTextArea = styled.textarea`
  resize: none;
`;

const StyledBody = styled.div`
  table tbody 
  {
    overflow: auto;
    max-height: 350px;
  }

  tr {
    height: 24px;
  }

  table-bordered {
    border: none;
  }
`;

const StyledToast = styled(Toast)`
  z-index: 100;
  top: 8px !important;
  right: 8px !important;
  background: #007bffba;
  border-color: none;
  color: white;
`;

class Dashboard extends Component {
  state = {
    showModal: false,
    show: false,
    saving: false,
    hasChanged: false,
    isEditing: false,
    checkingIn: false,
    rooms: [],
    room_types: [], 
    searchTerm: "",
    reservation:{
      room_type_id: 1,
      room_id: null,
      rate: 119.99,
      check_in_date: new Date(),
      check_out_date: new Date(Date.now() + 3600 * 1000 * 24),
      adults: 1,
      numRooms: 1,
      firstname: "",
      lastname: "",
      email: "",
      comments: "",
    },
    allReservations: [],
    errors: {},
  };

  async componentDidMount() {
    const { reservation } = this.state;
    api
      .getRoomTypes()
      .then((res) =>
        this.setState({
          room_types: res,
          reservation: {
            ...reservation,
            room_type_id: res[0].room_type_id,
            rate: res[0].rate
          }
        })
      )
      .catch((err) => console.log(err));
    await this.getAllRooms(); 
    this.getAllReservations();
  }

  getAllRooms = async () => {
    const { checkingIn } = this.state;
    await api
    .getArrivalsNew(
      {
        startDateRange: format(new Date(),'yyyy-MM-dd'),
        firstname: '',
        lastname: '',
        confirmationNumber: ''
      },
      new Date()
    )
    .then((res) => 
      this.setState({
        rooms: checkingIn ? res.rooms_arrivals.filter(
          roomtype =>  roomtype.occupied === 0
        ) : res.rooms_arrivals
      })
    )
    .catch((err) => console.log(err));
  }

  getAllReservations = () => {
    const { rooms } = this.state;
    api
      .getReservations()
      .then((res) =>  {
        const updatedReservations = res.map( reservation =>  {
          if (getTime(parseISO(reservation.check_out_date)) <= Date.now() && reservation.checked_in && !reservation.checked_out) {
            api
            .updateRoomCheckout(
              reservation.res_room_id,
              rooms.find(room => room.room_id === reservation.room_id).room_num) 
            return {...reservation, checked_out: 1}
          }
          else return reservation
        })
        this.setState({ allReservations: updatedReservations })
      })  
      .catch((err) => console.log(err));
  }

  handleModal = () => {
    this.setState((prevState) => ({
      showModal: !prevState.showModal,
      hasChanged: false,
      saving: false,
      isEditing: false,
      checkingIn: false,
      checkingOut: false,
      isCreating: false,
      isRoomChange: false, 
      errors: {},
      reservation: prevState.showModal ? {
        room_type_id: 1,
        check_in_date: new Date(),
        check_out_date: new Date(Date.now() + 3600 * 1000 * 24),
        nights: "",
        adults: 1,
        numRooms: 1,
        rate: 119.9,
        firstname: "",
        lastname: "",
        email: "",
        comments: "",
      } : { ...prevState.reservation }
    }));
  };

  handleNewReservation = () => {
    this.setState({
      isCreating: true,
      showModal: true,
    })
  }

  handleChangeRoom = () => {
    this.getAllRooms(); 
    this.setState({
      isRoomChange: true,
      showModal: true
    })
  }

  handleCheckIn = () => {
    this.getAllRooms();
    this.setState({
      showModal: true,
      checkingIn: true
    })
  }

  handleCheckOut = () => {
    this.getAllRooms();
    this.getAllReservations();
    this.setState({
      showModal: true,
      checkingOut: true
    })
  }

  updateData = () => {
    setTimeout(() => {
      this.getAllReservations();
      this.setState({
        saving: false,
      })
    }, 1000)
  }

  handleChange = (e) => {
    const { reservation, allReservations } = this.state;
    const { name } = e.target;
    if (name === "room_type_id") {
      console.log('test', this.state.reservation)
      const roomKey = parseInt(e.target.value) - 1;
      this.setState({ 
        reservation: {
        ...reservation,
        rate: this.state.room_types[roomKey].rate,
        [name]: +e.target.value,
        },
        hasChanged: true
    });
    } 
    else if(name === "reservation_id") {
      const selectedReservation = allReservations.find(r => r.reservation_id === +e.target.value);
      this.setState({
        currentReservation: +e.target.value,
        hasChanged: true,
        reservation: {
          ...selectedReservation,
          firstname: selectedReservation.first_name,
          lastname: selectedReservation.last_name,
          check_in_date: parseISO(selectedReservation.check_in_date),
          check_out_date: parseISO(selectedReservation.check_out_date),
          numRooms: 1,
          adults: 1,
        } 
      }, () => console.log(this.state.reservation))
    } 
    else if(name === "room_id") {
      this.setState({ 
        reservation: {
        ...reservation,        
        [name]: +e.target.value,
        },
        hasChanged: true
      })
    }
    else {
      this.setState({
        reservation: {
          ...reservation,
          [name]: e.target.value
        },
        hasChanged: true 
      });
    }
  };

  handleSearch = ({ target: { value = '' } = {} }) => {
    this.setState({ searchTerm: value });
  };

  validateForm = () => {
    let new_errors = {};
    const { isCreating, allReservations, reservation: {  firstname, lastname, email}  } = this.state;
    const uniqueEmail = allReservations.find( res => res.email === email && res.active) ? false : true;
    if (!firstname) {
      new_errors["firstname"] = "*Please enter your firstname.";
    }

    if (typeof firstname !== "undefined") {
      if (!firstname.match(/^[a-zA-Z ]*$/)) {
        new_errors["firstname"] = "*Please enter alphabet characters only.";
      }
    }
    if (!lastname) {
      new_errors["lastname"] = "*Please enter your lastname.";
    }

    if (typeof lastname !== "undefined") {
      if (!lastname.match(/^[a-zA-Z ]*$/)) {
        new_errors["lastname"] = "*Please enter alphabet characters only.";
      }
    }

    if (!email) {
      new_errors["email"] = "*Please enter your email";
    }

    if(isCreating && email && !uniqueEmail) {
      new_errors["email"] = "*A reservation is already using this email, please use another email";
    }

    const isValidForm = Object.keys(new_errors).length === 0;

    if(!isValidForm){
      this.setState({
        errors: new_errors,
      });
    }
    
    return isValidForm;
  };

  validateRequired = () => {
    const {  reservation: {  firstname, lastname, email, room_id, check_in_date, check_out_date }, errors, hasChanged, checkingIn  } = this.state;
    if(checkingIn){
      return (
        hasChanged && room_id && room_id !== 0
      )
    } else return (
      hasChanged && firstname !== undefined && firstname.trim().length >=2 &&
      lastname !== undefined && lastname.trim().length >=2 &&
      email !== undefined &&
      isBefore(check_in_date, check_out_date) &&
      errors.length !== 0
    )
  }

  handleSave = async (e) => {
    const { isCreating, reservation, checkingOut, isEditing, isRoomChange, checkingIn, rooms, reservation: { room_id }, currentReservation, allReservations} = this.state;
    e.preventDefault();
    this.setState({ saving: true});
    const reservationData = allReservations.find(res => res.reservation_id === currentReservation);
    if (this.validateForm()) {
      const data = {
        ...reservation,
        user_id: this.props.user.user_id
      };
      if(isCreating) {
        try {
          const res = await api.createReservation(data);
          this.setState({
            reservationSuccess: true,
            show: true,
            toastMessage: 'Reservation succesfully created',
            newReservationId: res.data.reservation_id
          });
          this.handleModal();
          this.updateData();
        } catch (err) {
          this.setState({
            show: true,
            toastMessage: 'Ooops, something went wrong, please try again',
          });
          console.log(err)
        }
      } else if(checkingIn) {
        try {
          const res = await api.cognitoCheckin({
            email: reservationData.email.toLowerCase(),
            reservationId: currentReservation,
            room: rooms.find(room => room.room_id === room_id).room_num,
            startDate: reservationData.check_in_date,
            endDate: reservationData.check_out_date
          });
          if(res && res.data.status !== 200 && res.data.status !== undefined || res.status !== 200) { 
            if(res.data.status === 401) {
              authapi.postCognitoLogin( null, (err, res) => {
                if (err === true) {
                  return err;
                }
              })
              this.setState({
                show: true,
                toastMessage: 'Ooops, something went wrong, please try again',
              });
            } else {
              this.setState({
                show: true,
                toastMessage: 'Ooops, make sure the entered information is valid',
              });
            }
          } else {
            api.updateRoomCheckin(reservation.res_room_id, room_id, 1);
            this.setState({ 
              reservationSuccess: true, 
              show: true,
              toastMessage: 'Check in succesfully completed' 
            });
            this.updateData();
          }
          this.handleModal();
        }
        catch(error){
          console.log('Error', error);
          authapi.postCognitoLogin( null, (err, res) => {
            if (err === true) {
              return err;
            }
          });
          this.handleModal();
          this.setState({
            show: true,
            toastMessage: 'Ooops, something went wrong, please try again',
          });
        }
      } else if(isRoomChange){
        try {
          const res = await  api.cognitoChangeRoom({reservationId: reservation.reservation_id, room: rooms.find(room => room.room_id === room_id).room_num });
          if(res && res.data.status !== 200) { 
            if(res.data.status === 401) {
              authapi.postCognitoLogin( null, (err, res) => {
                if (err === true) {
                  return err;
                }
              })
              this.setState({
                show: true,
                toastMessage: 'Ooops, something went wrong, please try again',
              });
            } else {
              this.setState({
                show: true,
                toastMessage: 'Ooops, make sure you choose a valid room',
              });
            }
          } else {
            api
            .updateRoomCheckin(reservation.res_room_id, room_id, {old_room: reservationData.room_id})
            this.setState({ 
              reservationSuccess: true, 
              show: true,
              toastMessage: 'Room succesfully updated'
            });
            this.updateData();
          }
          this.handleModal();
        } catch (error) {
          console.log(error);
          this.setState({
            show: true,
            toastMessage: 'Ooops, something went wrong, please try again',
          });
        }
      } else if (checkingOut) {
        try {
          const res = await api.cognitoCheckout({reservationId: reservation.reservation_id });
          if(res && res.data.status !== 200) { 
            if(res.data.status === 401) {
              authapi.postCognitoLogin( null, (err, res) => {
                if (err === true) {
                  return err;
                }
              })
              this.setState({
                show: true,
                toastMessage: 'Ooops, something went wrong, please try again',
              });
            } else {
              this.setState({
                show: true,
                toastMessage: 'Ooops, please verify the reservation status',
              });
            }
          } else {
            api
              .updateRoomCheckout(
                reservation.res_room_id,
                rooms.find(room => room.room_id === reservation.room_id).room_num,
              )
            this.setState({ 
              reservationSuccess: true, 
              show: true,
              toastMessage: 'Check out succesfully completed'
            });
            this.updateData();
          }
          this.handleModal(); 
        } catch (error) {
          console.log(error);
          this.setState({
            show: true,
            toastMessage: 'Ooops, something went wrong, please try again',
          });
        }
      } else if (isEditing){
        delete data.room_id;
        try {
          await api.updateReservation(data);
          this.setState({
            reservationSuccess: true,
            show: true,
            toastMessage: 'Reservation succesfully updated',
          })
          this.handleModal();
          this.updateData();
        } catch (error) {
          console.log(error);
          this.setState({
            show: true,
            toastMessage: 'Ooops, something went wrong, please try again',
          });
        }
      }
    }
    else {
      this.setState({ saving: false })
    };   
  };

  handleChosenReservation = id => {
    const { allReservations } = this.state;
    const currentRes = allReservations.find( res => res.reservation_id === id);
    if(currentRes.checked_in !== 0) return
    else {
      this.setState({ 
        showModal: true,
        isEditing: true,
        currentReservation: id,
        reservation: {
          ...currentRes,
          firstname: currentRes.first_name,
          lastname: currentRes.last_name,
          check_in_date: parseISO(currentRes.check_in_date),
          check_out_date: parseISO(currentRes.check_out_date),
          numRooms: 1,
          adults: 1,
        }
      });
    }    
  }

  showModalTitle = () => {
    const { checkingIn, checkingOut, isEditing, isRoomChange } = this.state;
    if(checkingIn){
      return <h4>Check in </h4> 
    } else if (isEditing){
      return <h4>Edit reservation </h4> 
    }
    else if (isRoomChange) {
      return <h4>Change Room </h4> 
    }
    else if (checkingOut) {
      return <h4>Check out </h4> 
    }
    else return  <h4>New Reservation</h4>;
  };

  showModalContent = () => {
    const {
      reservation:{
        reservation_id,
        check_in_date,
        check_out_date,
        room_type_id,
        numRooms, 
        adults,
        firstname,
        lastname,
        email,
        comments,
        room_id
      },
      checkingIn,
      checkingOut,
      isCreating,
      isEditing,
      isRoomChange,
      room_types,
      rooms,
      errors,
      reservation,
      allReservations      
    } = this.state;
    const reservationsList = isRoomChange ? allReservations?.length > 0 && allReservations.filter(res => res.room_id !== null) : checkingOut ? 
      allReservations.filter(res => res.checked_in === 1 && res.checked_out !== 1) : allReservations.filter(res => res.room_id === null);
    return (
      <Form method="post" name="reservationForm" onSubmit={this.handleSave}>
        {
          (checkingIn || isRoomChange || checkingOut) &&
          <Form.Row>
            <Col  className="form-group">
              <label htmlFor="reservation-id">Reservation</label>
              <select
                className="form-control"
                name="reservation_id"
                id="reservation-id"
                onChange={this.handleChange}
                value={reservation_id || 0}
              >
              <option value={0}>Select a reservation</option>
              {reservationsList?.filter(res => res.active === 1)
                .map(reservation => (
                  <option key={reservation.reservation_id} value={reservation.reservation_id}>
                    {`${reservation.first_name} ${reservation.last_name} - ${reservation.reservation_id}`}
                  </option>
                ))}
              </select>
            </Col>
            <Col  className="form-group">
              <label htmlFor="room-id">Room number</label>
              <select
                className="form-control"
                name="room_id"
                id="room-id"
                onChange={this.handleChange}
                value={room_id || 0}
                disabled={checkingOut}
              >
              <option value={0}>Select a room</option>
              {rooms
                .map(room => (
                  <option 
                    key={room.room_id} 
                    value={room.room_id}
                    disabled={room.occupied ? true : false}
                  >
                    {room.room_num}{' '}
                    {room.clean === 0 }
                  </option>
                ))}
              </select>
            </Col>
          </Form.Row>
          }
          <Form.Row>
          <Col>
            <StyledDatepicker >
              <label htmlFor="arrival-date">Arrival date</label>
              <DatePicker
                showTimeSelect
                dateFormat="MM/dd/yyyy h:mm aa"
                disabled={!(isCreating || isEditing)}
                selected={check_in_date}
                onChange={(date) => this.setState({ reservation: {...reservation, check_in_date: date}, hasChanged: true })}
                selectsStart
                check_in_date={check_in_date}
                check_out_date={check_out_date}
                minDate={new Date()}
                minTime={setHours(setMinutes(new Date(), 0), 9)}
                maxTime={setHours(setMinutes(new Date(), 30), 15)}
              />
            </StyledDatepicker>
          </Col>
          <Col>
            <StyledDatepicker>
              <label htmlFor="departure-date">Departure date</label>
              <DatePicker
                showTimeSelect
                disabled={!(isCreating || isEditing)}
                dateFormat="MM/dd/yyyy h:mm aa"
                selected={check_out_date}
                onChange={(date) => this.setState({ reservation: {...reservation, check_out_date: date }, hasChanged: true })}
                selectsEnd
                check_in_date={check_in_date}
                check_out_date={check_out_date}
                minDate={addDays(new Date(), 1)}
                minTime={setHours(setMinutes(new Date(), 0), 12)}
                maxTime={setHours(setMinutes(new Date(), 30), 15)}
              />
            </StyledDatepicker>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col className="form-group">
            <label htmlFor="number-of-adults">Adults</label>
            <StyledInput>
            <input
              className="form-control"
              type="number"
              name="adults"
              placeholder="Adults"
              id="number-of-adults"
              min={1}
              max={4}
              value={adults}
              disabled={!(isCreating || isEditing)}
              onChange={this.handleChange}
            />
            </StyledInput>
          </Col>
          <Col className="form-group">
            <label htmlFor="room-type">Room Type</label>
            <select
              className="form-control"
              name="room_type_id"
              id="room-type"
              disabled={!(isCreating || isEditing)}
              onChange={this.handleChange}
              value={room_type_id}
            >
              {room_types.map(type => (
                  <option key={type.room_type_id} value={type.room_type_id}>
                    {type.type} - {type.rate}
                  </option>
                ))}
            </select>
          </Col>
          <Col  className="form-group">
            <label htmlFor="number-of-rooms">Rooms</label>
            <input
              className="form-control"
              type="number"
              placeholder="Number of Rooms"
              disabled={!(isCreating || isEditing)}
              name="numRooms"
              id="number-of-rooms"
              value={numRooms}
              readOnly
            />
          </Col>
          <Col className="form-group">
            <label htmlFor="total-nights">Total nights</label>
            <input
              className="form-control"
              type="number"
              placeholder="Total nights"
              name="nights"
              id="total-nights"
              value={
                check_out_date &&
                Math.round((check_out_date - check_in_date) / (1000 * 60 * 60 * 24))
              }
              readOnly
              disabled={true}
              onChange={this.handleChange}
            />
          </Col>
        </Form.Row>
        <Form.Row>
          <Col className="form-group">
            <label htmlFor="first-name-input">First Name</label>
            <input
              className="form-control"
              type="text"
              name="firstname"
              id="first-name-input"
              placeholder="First Name"
              disabled={!(isCreating || isEditing)}
              value={firstname}
              onChange={this.handleChange}
            />
            <div className="text-danger">{errors.firstname || ""}</div>
          </Col>
          <Col className="form-group">
            <label htmlFor="last-name-input">Last Name</label>
            <input
              className="form-control"
              type="text"
              name="lastname"
              id="last-name-input"
              disabled={!(isCreating || isEditing)}
              placeholder="Last Name"
              value={lastname}
              onChange={this.handleChange}
            />
            <div className="text-danger">{errors.lastname || ""}</div>
          </Col>
          <Col className="form-group">
            <label htmlFor="email-input">Email</label>
            <input
              className="form-control"
              type="text"
              name="email"
              id="email-input"
              disabled={!(isCreating || isEditing)}
              placeholder="Email "
              value={email}
              onChange={this.handleChange}
            />
            <div className="text-danger">{errors.email || ""}</div>
          </Col>
        </Form.Row>
        <Row className='d-flex justify-content-center'>
          <Col className="form-group" md={9} lg={8}>
            <label htmlFor="room-comments">Comments</label>
            <StyledTextArea
              className="form-control"
              type="text"
              name="comments"
              disabled={!(isCreating || isEditing)}
              id="room-comments"
              value={comments || ""}
              onChange={this.handleChange}
            />
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const { showModal, show, allReservations, searchTerm, saving, room_types, toastMessage } = this.state;
    const filteredReservations = allReservations?.length > 0 ? allReservations.filter(item => 
      item.first_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).reverse() : [];
    return (
      <>
        <Modal
          show={showModal}
          onHide={this.handleModal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              {this.showModalTitle()}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.showModalContent()}</Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={this.handleModal}>
              Cancel
            </Button>
            {saving ? (
              <Button variant="primary" disabled>
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                Saving...
              </Button>
            ) : (
              <Button
                disabled={!this.validateRequired()}
                onClick={this.handleSave}
              >
                Save
              </Button>
            )}
          </Modal.Footer>
        </Modal>
        <Row className="px-10">
          <Col xs={12} md={8}>
            <Card className="reservations-list">
              <Card.Header as="h4" className="text-center">
                All reservations
              </Card.Header>
              <Card.Body>
                <StyledBody>
                  {allReservations.length !== 0 ? (
                    <Col>
                      <SearchBox
                        searchTerm={searchTerm}
                        onChange={this.handleSearch}
                        placeholder="Search"
                      />
                      <Table striped bordered hover variant="light">
                        <tbody>
                          <tr>
                            <th>Reservation</th>
                            <th>Customer name</th>
                            <th>Arrival Date</th>
                            <th>Departure Date</th>
                            <th>Room Type</th>
                            <th>Status</th>
                          </tr>

                          {filteredReservations.map((res) => (
                            <tr
                              key={res.res_room_id}
                              onClick={() =>
                                this.handleChosenReservation(res.reservation_id)
                              }
                            >
                              <td>{res.reservation_id}</td>
                              <td>{`${res.first_name} ${res.last_name}`}</td>
                              <td>
                                {format(
                                  parseISO(res.check_in_date),
                                  "MM/dd/yyyy hh:mm"
                                ).toString()}
                              </td>
                              <td>
                                {format(
                                  parseISO(res.check_out_date),
                                  "MM/dd/yyyy hh:mm"
                                ).toString()}
                              </td>
                              <td>
                                {
                                  room_types.length > 0 && room_types.find(
                                    type =>
                                      type.room_type_id === res.room_type_id
                                  ).type
                                }
                              </td>
                              <td>
                                {res.checked_in && res.active ? "Checked in" : res.active ? "Active" : "Inactive"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  ) : (
                    <div>Reservations will be listed here </div>
                  )}
                </StyledBody>
              </Card.Body>
            </Card>
          </Col>
          <Col className="px-20" xs={6} md={4}>
            <Card className="mx-0 px-0">
              <Card.Header as="h4" className="text-center">
                Front desk actions
              </Card.Header>
              <Card.Body>
                <Button
                  onClick={this.handleNewReservation}
                  type="submit"
                  size="block"
                  variant="custom"
                >
                  New Reservation
                </Button>
                <Button
                  onClick={this.handleChangeRoom}
                  type="submit"
                  size="block"
                  variant="custom"
                >
                  Change room
                </Button>
                <Button
                  onClick={this.handleCheckIn}
                  type="submit"
                  size="block"
                  variant="custom"
                >
                  Check in
                </Button>
                <Button
                  onClick={this.handleCheckOut}
                  type="submit"
                  size="block"
                  variant="custom"
                >
                  Check out
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <StyledToast
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            autohide
            onClose={() => this.setState({ show: false })}
            show={show}
            delay={3000}
          >
            <Toast.Body>{toastMessage}</Toast.Body>
          </StyledToast>
        </Row>
      </>
    );
  }
}

export default Dashboard;
