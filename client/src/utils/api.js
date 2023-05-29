import axios from 'axios'

export default {
  getReservation: id =>
    axios
      .all([
        axios.get('/api/hw/reservation/' + id),
        axios.get('/api/hw/res_rooms/' + id)
      ])
      .then(
        axios.spread((resCust, resRooms) => ({
          resCust: resCust.data,
          resRooms: resRooms.data
        }))
      ),
  createReservation: data => {
    return axios
      .post('/api/hw/reservation', {
        cust: [
          data.firstname,
          data.lastname,
          data.email
        ],
        reserve: [data.user_id, ''],
        rooms: [
          [
            data.room_type_id,
            data.check_in_date,
            data.check_out_date,
            data.adults,
            data.rate,
            data.comments
          ]
        ]
      })
      .then(response => response)
      .catch(error => {
        console.log(error)
      })
  },
  updateReservation: data => {
    return axios
      .put('/api/hw/reservation', {
        cust: [
          data.firstname,
          data.lastname,
          data.email,
          data.customer_id
        ],
        reserve: [data.user_id, '', data.reservation_id],
        rooms: [
          [
            data.room_type_id,
            data.check_in_date,
            data.check_out_date,
            data.adults,
            data.comments,
            data.res_room_id
          ]
        ]
      })
      .then(response => response)
      .catch(error => {
        console.log(error)
      })
  },
  getReservations: () =>
    axios
      .get('/api/hw/reservations')
      .then(response => response.data)
      .catch(error => {
        console.log(error)
      }),
  getRoomTypes: () =>
    axios
      .get('/api/room/types')
      .then(response => response.data)
      .catch(error => {
        console.log(error)
      }),
  // Cognito requests
  cognitoCheckin: data => 
    axios
      .post('/api/reservations/cognito-checkin', { data })
      .then(response => response)
      .catch(error => {
        console.log(error)
      }),
  cognitoChangeRoom: data =>
      axios
        .patch('api/hw/cognito-change-room', { data })
        .then(response => response)
        .catch(error => {
          console.log(error)
        }),
  cognitoCheckout: data => 
        axios
          .post('api/hw/cognito-checkout', { data })
          .then(response => response)
          .catch(error => {
            console.log(error)
          }),
  updateRoomCheckin: (id, room_id, data) =>
    axios
      .put(`/api/hw/checkinRoom/${id}/${room_id}`, { old_room: data.old_room })
      .then(response => response)
      .catch(error => {
        console.log(error)
      }),
  updateRoomCheckout: (id, room_num) =>
    axios
      .put(`/api/hw/checkoutRoom/${id}/${room_num}`)
      .then(res => res)
      .catch(error => {
        console.log(error)
      }),
  getArrivalsNew: (criteria, date) => {

    return axios
      .all([
        axios.get(`/api/hw/rooms_arrivals/${date}`)
      ])
      .then(
        axios.spread((rooms_arrivals) => ({
          rooms_arrivals: rooms_arrivals.data
        }))
      )
  },
  getHotelInfo: id =>
    axios
      .get(`/api/hw/hotel_info/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.log(error)
      }),
}
