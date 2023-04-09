// extract bookings from the database and display them in a table
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { saveAs } from 'file-saver';


function MyBookings() {
  const handleDownload = (confirmationId) => {
    fetch('http://localhost:3001/pdf/' + confirmationId)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, `${confirmationId}-booking-confirmation.pdf`);
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  };
  const [userEmail, setUserEmail] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const fetchUserBookings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/get-user-bookings?email=${userEmail}`);
      const data = await response.json();
      setUserBookings(data[0].bookings);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  // Get user email from cookie
  useEffect(() => {
    const email = Cookies.get('email');
    setUserEmail(email);
    console.log(email);
  }, []);
  // Fetch user bookings when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchUserBookings();
    }
  }, [userEmail]);

  if (!userBookings) {
    return <div>No Bookings Made</div>;
  }
  

  return (
    <div>
      <h1>My Bookings</h1>
      <div className="container my-3  w-100 bg-white border border-rounded">
        <div className="vh-100 d-flex justify-content-center">
          <div className="col-md-12">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Booking ID</th>
                  <th scope="col">Booking Date</th>
                  <th scope="col">Origin</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {userBookings.map((booking, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <th scope="row">{booking.confirmationId}</th>
                    <th scope="row">{booking.bookingDate}</th>
                    <th scope="row">{booking.arrivalairport}</th>
                    <th scope="row">{booking.departureairport}</th>
                    {/* create download button with the pathway available from the booking variable */}
                    <th scope="row"><button className='btn btn-primary' onClick={() => handleDownload(booking.confirmationId)}>Download</button></th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBookings;