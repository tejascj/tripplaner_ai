import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import PopupShareModal from './sharelink';
function MyItineraries() {
  const [userEmail, setUserEmail] = useState(null);
  const [userItineraries, setUserItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pointOfInterestLinks, setPointOfInterestLinks] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  if (selectedItinerary) {
    console.log(selectedItinerary.openAiResponse.choices[0].text);
  }

  const shareItinerary = async () => {
    setImageUrl(''); // Reset image url
    try {
      const responsetext = selectedItinerary.openAiResponse.choices[0].text.split('\n').join('\n');

      const destinationtext = selectedItinerary.destination;
      const textdata = {
        destination: destinationtext,
        openairesponse: responsetext
      };
      const response = await fetch('http://localhost:3001/create-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(textdata)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      const imageUrl = data.image;
      console.log('Image uploaded to Imgur:', imageUrl);
      setImageUrl(imageUrl);
      setShowModal(false);
    } catch (error) {
      console.log('Error uploading image to Imgur:', error.message);
    }
  };


  // Fetch user itineraries from server
  const fetchUserItineraries = async () => {
    try {
      const response = await fetch(`http://localhost:3001/get-user-itineraries?email=${userEmail}`);
      const data = await response.json();
      setUserItineraries(data[0].queries);
      console.log(data[0].queries);
    } catch (error) {
      console.error(error);
    }
  };

  // Get user email from cookie
  useEffect(() => {
    const email = Cookies.get('email');
    setUserEmail(email);
  }, []);

  // Fetch user itineraries when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchUserItineraries();
    }
  }, [userEmail]);

  // Open modal when itinerary is selected
  const handleViewDetails = (index) => {
    console.log(index);
    setPointOfInterestLinks(userItineraries[index].pointsOfInterestLinks);
    setSelectedItinerary(userItineraries[index]);
    setShowModal(true);
    console.log(selectedItinerary);
    console.log(pointOfInterestLinks);
  };


  // Close modal when X button is clicked
  const handleModalClose = () => {
    setShowModal(false);
  };

  if (!userItineraries) {
    return <div>No Itineraries Generated</div>;
  }

  return (
    <div>
      {imageUrl && <PopupShareModal imageUrl={imageUrl} show={true} isCopied={false} />}
      <h1>My Itineraries</h1>
      <div className="container my-3  w-100  border border-rounded">

        <div className="vh-100 d-flex justify-content-center">
          <div className="col-md-12">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Days</th>
                  <th scope="col">Created_At</th>
                  <th scope="col">View</th>
                </tr>
              </thead>
              <tbody>
                {userItineraries.map((itinerary, index) => (

                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{itinerary.destination}</td>
                    <td>{itinerary.days}</td>
                    <td>{new Date(itinerary.timestamp).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleViewDetails(index)}>View</button>

                    </td>

                  </tr>
                ))}
                <Modal className="modal modal-xl" show={showModal} onHide={handleModalClose} backdrop="static" centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Itinerary</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {selectedItinerary && (
                      <>
                        <div className='clearfix'>
                          <div><h1>Amazing {selectedItinerary.days} Days Itinerary for {selectedItinerary.destination}</h1></div>
                          <div><button className="btn btn-primary" onClick={shareItinerary} >
                            <FontAwesomeIcon icon={faShare} className="me-2" />
                            Share Itinerary
                          </button>
                          </div>
                        </div>
                        <hr />
                        <div className="row">
                          <div className="col-8">
                            <div className="container mx-auto my-3 w-100 bg-light" style={{ textAlign: 'left' }}>
                              <p>
                                {selectedItinerary && selectedItinerary.openAiResponse.choices[0].text.split('\n').map((item, i) => {
                                  return <React.Fragment key={i}>{item}<br /></React.Fragment>;
                                })
                                }
                              </p>
                            </div>
                          </div>
                          <div className="col-4">
                            {pointOfInterestLinks ?
                              <div className="container mx-auto my-3 w-85" style={{ position: 'sticky', top: '20px' }}>
                                {/* create sub title as Trip itienary */}
                                <h2 className='p-2'>
                                  Point of interest
                                </h2>
                                <div className='bg-light'><ul>
                                  {pointOfInterestLinks.map(point => (
                                    <li key={point.pointOfInterest}>
                                      <a href={point.link} target="_blank" rel="noopener noreferrer">{point.pointOfInterest}</a>
                                    </li>
                                  ))}
                                </ul>
                                </div>
                              </div>

                              : <p>no pointOfInterestLinks</p>}
                          </div>
                        </div>

                      </>
                    )}
                  </Modal.Body>

                  <Modal.Footer>
                    <button className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                  </Modal.Footer>
                </Modal>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MyItineraries;

