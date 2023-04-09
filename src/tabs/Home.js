import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { airportsData } from '../airports';
import { Form, ListGroup, Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import PopupShareModal from './sharelink';
import { saveAs } from 'file-saver';
function Home(props) {
    const [showModal, setShowModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const handleBuyButtonClick = (index) => {
        setSelectedFlight(amadeusResponse[index]);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };
    const handleTicketClose = () => {
        setPassengerNames([]);
        setCardName('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setContact('');
        setEmail('');
        setShowTicketModal(false);
    };

    const handleTicketDownload = () => {
        fetch(`http://localhost:3001/pdf/${confirmationId}`)
            .then((response) => response.blob())
            .then((blob) => {
                saveAs(blob, `${confirmationId}-booking-confirmation.pdf`);
            })
            .catch((error) => {
                console.error('Error downloading file:', error);
            });
    };
    // login and offcanvas components
    // const [logged_in, setLoggedIn] = useState(false);

    const [date, setDate] = useState('');
    const [srno, setSrno] = useState('');
    const [people, setPeople] = useState('');
    const [passengerNames, setPassengerNames] = useState([]);

    const handlePassengerInputChange = (e, index) => {
        setPassengerNames((prevPassengerNames) => {
            // Create a copy of the previous passenger names array
            const newPassengerNames = [...prevPassengerNames];
            // Update the name of the passenger at the given index
            newPassengerNames[index] = {
                ...newPassengerNames[index],
                [e.target.name]: e.target.value,
            };
            // Return the updated passenger names array
            return newPassengerNames;
        });
    };
    const passengerIndexes = Array.from({ length: people }, (_, i) => i);
    const [Contact, setContact] = useState('');
    const [Email, setEmail] = useState('');
    const handleconstactInputChange = (e) => {
        setContact(e.target.value);
    };
    const handleEmailInputChange = (e) => {
        setEmail(e.target.value);
    };
    // show loading button
    const [loading, setLoading] = useState(false);
    // handling show more button
    const [numToShow, setNumToShow] = useState(1);
    // Define function to update state variable when "show more" button is clicked
    const handleShowMore = () => {
        setNumToShow(numToShow + 1);
    }
    // End of handling show more button
    // handling the checkbox
    const [isChecked, setIsChecked] = useState(false);
    // End of handling the checkbox
    const [destination, setDestination] = useState('');
    // const [response, setResponse] = useState('');
    const [days, setDays] = useState('');
    // flight details
    const [query1, setQuery1] = useState("");
    const [selectedAirport1, setSelectedAirport1] = useState({ name: "", city: "", country: "", iata: "" });
    const [query2, setQuery2] = useState("");
    const [selectedAirport2, setSelectedAirport2] = useState({ name: "", city: "", country: "", iata: "" });
    const filteredAirports1 = airportsData.filter((airport) =>
        airport.name.toLowerCase().includes(query1.toLowerCase()) ||
        airport.area.toLowerCase().includes(query1.toLowerCase()) ||
        airport.city.toLowerCase().includes(query1.toLowerCase()) ||
        airport.iata.toLowerCase().includes(query1.toLowerCase())
    );
    const filteredAirports2 = airportsData.filter((airport) =>
        airport.name.toLowerCase().includes(query2.toLowerCase()) ||
        airport.area.toLowerCase().includes(query2.toLowerCase()) ||
        airport.city.toLowerCase().includes(query2.toLowerCase()) ||
        airport.iata.toLowerCase().includes(query2.toLowerCase())
    );
    const handleInputChange1 = (event) => {
        setQuery1(event.target.value);
    };
    const handleInputChange2 = (event) => {
        setQuery2(event.target.value);
    };
    const handleOptionClick1 = (airport) => {
        setSelectedAirport1(airport);
        console.log(airport);
        setQuery1(`${airport.name} (${airport.iata})`);
    };
    const handleOptionClick2 = (airport) => {
        setSelectedAirport2(airport);
        console.log(airport);
        setQuery2(`${airport.name} (${airport.iata})`);
    };
    // handling the form submission for open ai and amadeus api
    const [openAiResponse, setOpenAiResponse] = useState(null);
    const [amadeusResponse, setAmadeusResponse] = useState(null);
    const [pointOfInterest, setPointOfInterest] = useState(null);
    const [bookingloading, setBookingLoading] = useState(false);
    // console.log(amadeus);
    const handleSubmit = (e) => {
        e.preventDefault();
        const requestData = {
            destination: destination,
            days: days,
            flight1: selectedAirport1.iata,
            flight2: selectedAirport2.iata,
            date: date,
            people: people
        };

        // Only send Amadeus request if checkbox is checked
        if (isChecked) {
            setBookingLoading(true);
            fetch('http://localhost:3001/flight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Amadeus Response: ", data);
                    setAmadeusResponse(data);
                    setBookingLoading(false);
                });
        }

        // Always send OpenAI request
            setLoading(true);
            fetch('http://localhost:3001/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            }).then(res => res.json())
                .then(data => {
                    // console.log("OpenAI Response: ", data.openAiResponse);
                    setOpenAiResponse(data.openAiResponse);


                    // console.log("Itinerary: ", data.openAiResponse.choices[0].text);
                    const openAiResponseData = data.openAiResponse;
                    const destinationdata = destination;
                    const daysdata = days;
                    // Store OpenAI response to user document in MongoDB
                    const userEmail = Cookies.get('email');


                    setLoading(false);

                    // Fetch points of interest
                    const pointsOfInterestPrompt = 'Extract the points of interest out of this text, with no additional words, separated by commas: ' + data.openAiResponse.choices[0].text;
                    fetch('http://localhost:3001/get-points-of-interest', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pointsOfInterestPrompt: pointsOfInterestPrompt
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            const pointsOfInterest = JSON.parse(data.pointsOfInterest);
                            // console.log("Points of interest: ", pointsOfInterest);
                            const pointOfInterestLinks = pointsOfInterest.map(point => {
                                return {
                                    pointOfInterest: point,
                                    link: `https://www.viator.com/searchResults/all?pid=P00089289&mcid=42383&medium=link&text=${encodeURIComponent(point + ' ' + destination)}`
                                };
                            });
                            setPointOfInterest(pointOfInterestLinks);
                            // console.log("Points of Interest Links: ", pointOfInterestLinks);

                            fetch('http://localhost:3001/update-user-itinerary', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    email: userEmail,
                                    destination: destinationdata,
                                    days: daysdata,
                                    openAiResponse: openAiResponseData,
                                    pointOfInterestLinks: pointOfInterestLinks
                                })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    console.log("User document updated with OpenAI response and point of interest links: ", data);
                                })
                                .finally(() => {
                                    setLoading(false);
                                });
                        });
                });
        
    };
    // Payment form handling
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cvv, setCvv] = useState('');
    const [expiry, setExpiry] = useState('');
    const handleCardNumberChange = (event) => {
        // Only allow digits and spaces
        const newCardNumber = event.target.value.replace(/[^\d ]/g, '');
        setCardNumber(newCardNumber);
    };
    const handleCardNameChange = (event) => {
        setCardName(event.target.value);
    };
    const handleCvvChange = (event) => {
        // Only allow up to 3 digits
        const newCvv = event.target.value.slice(0, 3);
        setCvv(newCvv);
    };
    const handleExpiryChange = (event) => {
        // Only allow digits and a forward slash
        const newExpiry = event.target.value.replace(/[^\d/]/g, '');
        setExpiry(newExpiry);
    };
    const [isagreed, setIsAgreed] = useState(false);
    const handleAgreeChange = (event) => {
        setIsAgreed(event.target.checked);
    };
    const [pnr, setPnr] = useState('');
    const generateConfirmationId = () => {
        const randomNumber = Math.floor(Math.random() * 10 ** 14).toString().padStart(14, '0');
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomCharacters = Array.from({ length: 4 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        const randomNumbers = Math.floor(Math.random() * 90 + 10).toString();
        setPnr(randomCharacters + randomNumbers);
        console.log("randomCharacters: ", randomCharacters, "randomNumbers: ", randomNumbers, "randomNumber: ", randomNumber);
        return randomNumber;
    }
    
    const [confirmationId, setConfirmationId] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    // create variables for error mesasges for each field
    const [nameError, setNameError] = useState('');
    const [contactError, setContactError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [cardError, setCardError] = useState('');
    const [termsError, setTermsError] = useState('');
    const validateEmail = (email) => {
        // Regular expression to match email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleBooking = () => {
        if (passengerNames.length != people) {
            setNameError('Please fill in all passengers fields.');
            console.log("nameerror:", nameError)
            return;
        }
        if (!Email || !validateEmail(Email)) {
            setEmailError('Please enter a valid email address.');
            console.log("emailerror:", emailError)
            return;
        }
        if (!Contact || Contact.length != 10) {
            setContactError('Please enter a valid contact number.');
            console.log("contacterror:", contactError)
            return;
        }
        // Validate the email address


        // Validate the credit card information
        if (!cardNumber || !cardName || !cvv || !expiry) {
            setCardError('Please enter valid credit card information.');
            console.log("carderror:", cardError)
            return;
        }
        if (!isagreed) {
            setTermsError('Please agree to the terms and conditions.');
            console.log("termserror:", termsError)
            return;
        }
        console.log('Booking...')

        setBookingLoading(true);
        console.log(amadeusResponse)
        const userEmail = Cookies.get('email');
        console.log(userEmail)
        const data = {
            usermail: userEmail,
            airline: amadeusResponse[selectedFlight.id].itineraries[0].segments[0].carrierCode,
            flightNumber: amadeusResponse[selectedFlight.id].itineraries[0].segments[0].number,
            departureDate: amadeusResponse[selectedFlight.id].itineraries[0].segments[0].departure.at,
            arrivalDate: amadeusResponse[selectedFlight.id].itineraries[0].segments[0].arrival.at,
            arrivalairport: selectedAirport1.area,
            departureairport: selectedAirport2.area,
            flightcode: amadeusResponse[selectedFlight.id].itineraries[0].segments[0].carrierCode,
            people: people,
            passengers: passengerNames,
            contact: Contact,
            email: Email,
            baseprice: (amadeusResponse[selectedFlight.id].price.total - (amadeusResponse[selectedFlight.id].price.total * 0.12)) / 2,
            additionalServices: amadeusResponse[selectedFlight.id].price.additionalServices[0].amount,
            tax: (amadeusResponse[selectedFlight.id].price.total * 0.12),
            totalprice: amadeusResponse[selectedFlight.id].price.total,
            confirmationId: generateConfirmationId(),
            ticketPNR: pnr,
            bookingDate: new Date().toISOString().slice(0, 10),
            cardname: cardName,
            cardnumber: cardNumber,
        };
        setConfirmationId(data.confirmationId);
        setBookingDate(data.bookingDate);
        console.log('Sending booking details to server...');
        fetch('http://localhost:3001/pdfbooking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(console.log('Booking details sent to server'))
            .then(response => {
                if (response.ok) {
                    setBookingLoading(false);
                    setShowModal(false)
                    setShowTicketModal(true);

                } else {
                    response.text().then(errorMessage => {
                        alert(`Error: ${errorMessage}`);
                    });
                }
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
            });


    };
    const [imageUrl, setImageUrl] = useState('');
    const shareItinerary = async () => {
        setImageUrl('');
        try {
            const responsetext = openAiResponse.choices[0].text.split('\n').join('\n');

            const destinationtext = destination;
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
    return (
        <div className="homepage">
            {imageUrl && <PopupShareModal imageUrl={imageUrl} show={true} isCopied={false} />}
            <div className="container border rounded p-3 m-auto w-100 ">
                <form onSubmit={handleSubmit}>

                    <div className="row g-2 align-items-center">
                        <div className="form-floating col-md-3">
                            <input type="text" className="form-control" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination name" aria-label="Destination" />
                            <label htmlFor="floatingInput">Destination</label>
                        </div>
                        <div className="form-floating col-md-3">
                            <input type="number" className="form-control" value={days} onChange={e => setDays(e.target.value)} placeholder="Number of Days" aria-label="No of days" min="1" max="7" />
                            <label htmlFor="floatingInput">Number of Days</label>
                            <div className="invalid-feedback">
                                Please enter a message in the textarea.
                            </div>
                        </div>
                        <div className="col-md-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                            /><label className="form-check-label">
                                Cheapest Flight reccomendation
                            </label></div>
                        <div className="col-md-2">
                            <input type="submit" value="submit" className="form-control" aria-label="Last name" />
                        </div>

                        <div className="form-floating col-md-3">
                            {isChecked && (
                                <>
                                    <Form.Control
                                        type="text"

                                        onChange={handleInputChange1}
                                        value={query1}
                                        placeholder="Search for origin airport..."
                                        required
                                    />
                                    <label htmlFor="floatingInput">Origin Airport</label>
                                    {query1.length >= 3 && (
                                        <ListGroup style={{ position: "absolute", zIndex: 100, width: 350 }}>
                                            {filteredAirports1.slice(0, 5).map((airport, index) => (
                                                <ListGroup.Item
                                                    action
                                                    key={index}
                                                    onClick={() => handleOptionClick1(airport)}
                                                >
                                                    {airport.name} ({airport.iata})<br />{airport.area}, {airport.city}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="form-floating col-md-3">
                            {isChecked && (
                                <>
                                    <Form.Control
                                        type="text"
                                        onChange={handleInputChange2}
                                        value={query2}
                                        placeholder="Search for destination airport..."
                                        required
                                    />
                                    <label htmlFor="floatingInput">Destination Airport</label>
                                    {query2.length >= 3 && (
                                        <ListGroup style={{ position: "absolute", zIndex: 100, width: 300 }}>
                                            {filteredAirports2.slice(0, 5).map((airport, index) => (
                                                <ListGroup.Item
                                                    action
                                                    key={index}
                                                    onClick={() => handleOptionClick2(airport)}
                                                >
                                                    {airport.name} ({airport.iata})<br />{airport.area}, {airport.city}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="form-floating col-md-2">
                            {isChecked && (
                                <>
                                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} placeholder="Departure Date" aria-label="Departure Date" min={new Date().toISOString().split("T")[0]} required />
                                    <label htmlFor="floatingInput">Departure Date</label>
                                </>
                            )}
                        </div>
                        <div className="form-floating col-md-2">
                            {isChecked && (
                                <>
                                    <input type="number" className="form-control" value={people} onChange={e => setPeople(e.target.value)} min="1" max="10" required />
                                    <label htmlFor="floatingInput">People</label>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            
                    {bookingloading  && isChecked && (
                        <button className="btn btn-primary m-4 p-2" type="button" disabled>
                            <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                            Flight Loading...
                        </button>
                    )}
                    {amadeusResponse && (

                        <div className="container my-3 p-3 w-100 bg-white border">
                            <label>Flight Recommendations</label>
                            {/* Flight Details Card */}
                            {amadeusResponse && Object.values(amadeusResponse).slice(0, numToShow).map((_, index) => (

                                <div key={index}>
                                    <div className="container my-3 pt-2 w-100 bg-light">
                                        <div className="row">
                                            <div className="col-3">
                                                <img src={`https://images.kiwi.com/airlines/64/${amadeusResponse[index].itineraries[0].segments[0].carrierCode}.png`} alt={amadeusResponse[index].itineraries[0].segments[0].carrierCode} />
                                            </div>
                                            <div className="col-7">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="origin">
                                                            {selectedAirport1.area}
                                                            <div className="departure-time">{amadeusResponse[index].itineraries[0].segments[0].departure.at}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                                            <path fillRule="evenodd" d="M8.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L14.293 8 8.646 2.354a.5.5 0 0 1 0-.708z" />
                                                            <path fillRule="evenodd" d="M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                                                        </svg>
                                                    </div>

                                                    <div className="col-3">
                                                        <div className="destination">
                                                            {selectedAirport2.area}
                                                            <div className="arrival-time">{amadeusResponse[index].itineraries[0].segments[0].arrival.at}</div>
                                                        </div>
                                                    </div>


                                                </div>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="flight-code">Flight Code:{amadeusResponse[index].itineraries[0].segments[0].carrierCode} {amadeusResponse[index].itineraries[0].segments[0].number}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="price">
                                                    <div className="price-text">Price</div>
                                                    <div className="price-value">₹{amadeusResponse[index].price.total}</div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="BUY">
                                                        <button className="btn btn-primary" onClick={() => handleBuyButtonClick(index)}>BUY</button>

                                                        <Modal className="modal modal-xl" show={showModal} onHide={handleModalClose} backdrop="static" centered>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Flight Booking</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>

                                                                {selectedFlight && (

                                                                    <div className="row">
                                                                        <div className="col-8">
                                                                            <div className="container-fluid my-3 p-2 border">
                                                                                <h5 className="bg-light p-2">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16">
                                                                                        <path
                                                                                            d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2H248.4c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48H542.8c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32H608c17.7 0 32-14.3 32-32s-14.3-32-32-32H32c-17.7 0-32 14.3-32 32z" />
                                                                                    </svg>Flight Details
                                                                                </h5>
                                                                                <div className="row">
                                                                                    <div className="col-2">
                                                                                        <img src={`https://images.kiwi.com/airlines/64/${amadeusResponse[index].itineraries[0].segments[0].carrierCode}.png`} alt={amadeusResponse[index].itineraries[0].segments[0].carrierCode} />
                                                                                    </div>
                                                                                    <div className="col-10">
                                                                                        <div className="row">
                                                                                            <div className="col-5 text-center">
                                                                                                <div className="origin">
                                                                                                    {selectedAirport1.area}
                                                                                                    <div className="departure-time">{amadeusResponse[index].itineraries[0].segments[0].departure.at}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-2 text-center ">
                                                                                                <div>
                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                                                                                        <path fillRule="evenodd" d="M8.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L14.293 8 8.646 2.354a.5.5 0 0 1 0-.708z">
                                                                                                        </path>
                                                                                                        <path fillRule="evenodd" d="M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z">
                                                                                                        </path>
                                                                                                    </svg>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-5 text-center">
                                                                                                <div className="destination">
                                                                                                    {selectedAirport2.area}
                                                                                                    <div className="arrival-time">{amadeusResponse[index].itineraries[0].segments[0].arrival.at}</div>
                                                                                                </div>
                                                                                            </div>


                                                                                        </div>
                                                                                        <div className="row">
                                                                                            <div className="col-12 text-center">
                                                                                                <div className="flight-code">Flight Code:{amadeusResponse[index].itineraries[0].segments[0].carrierCode} {amadeusResponse[index].itineraries[0].segments[0].number}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                </div>
                                                                            </div>
                                                                            {/* IMP Things */}
                                                                            <div className='container-fluid  my-3 p-2 border'>

                                                                                <h5 className='bg-light p-2'><img src='https://flight.easemytrip.com/m_content/img/f-icon-9.png'></img>Good to Know</h5>
                                                                                <p>Information you should know</p>
                                                                                <ul>
                                                                                    <li>Airline Cancellation Fee is Rs 3000 per passenger for your selected flight on the sector {selectedAirport1.area} to {selectedAirport2.area}</li>
                                                                                    <li>Certify your health status through the Aarogya Setu app or the self-declaration form at the airport</li>
                                                                                    <li>Remember to web check-in before arriving at the airport</li>
                                                                                    <li>Face masks are compulsory</li>
                                                                                </ul>

                                                                            </div>
                                                                            {/* End of IMP Things */}

                                                                            <div className='my-3 p-2 w-100 border'>
                                                                                <div className='clearfix bg-light p-2'>
                                                                                    <h5 className='float-start'>
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-people-fill" viewBox="0 0 16 16">
                                                                                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                                                                        </svg>
                                                                                        Passenger Details</h5>
                                                                                    <div className='float-end'><img src='https://flight.easemytrip.com/M_Content/img/g-id-icon.png' width={20}></img>Name should be same as in Government ID proof</div>
                                                                                </div>


                                                                                {passengerIndexes.map((index) => (
                                                                                    <div className="row mb-3" key={index}>
                                                                                        <h2>{`Passenger ${index + 1}`}</h2>
                                                                                        <div className="col">
                                                                                            <input
                                                                                                type="text"
                                                                                                className="form-control mb-3"
                                                                                                placeholder={`First Name`}
                                                                                                required
                                                                                                name="firstName"
                                                                                                value={passengerNames[index]?.firstName || ""}
                                                                                                onChange={(e) => handlePassengerInputChange(e, index)}
                                                                                                onFocus={() => { setNameError('') }}
                                                                                            />
                                                                                            <input
                                                                                                type="text"
                                                                                                className="form-control"
                                                                                                placeholder={`Last Name`}
                                                                                                required
                                                                                                name="lastName"
                                                                                                value={passengerNames[index]?.lastName || ""}
                                                                                                onChange={(e) => handlePassengerInputChange(e, index)}
                                                                                                onFocus={() => { setNameError('') }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                {nameError && <div className='text-danger'>{nameError}</div>}

                                                                            </div>

                                                                            <div className='my-3 p-2 w-100 border'>
                                                                                <div className='clearfix bg-light p-2'>
                                                                                    <h5 className='float-start'>Contact Information</h5>
                                                                                    <div className='float-end'>(Your ticket will be sent to this email address)</div>
                                                                                </div>
                                                                                <div className=' m-1'>
                                                                                    <h6>Email</h6>
                                                                                    <input
                                                                                        type="email"
                                                                                        className="form-control mb-3"
                                                                                        placeholder="Email Address"
                                                                                        value={Email}
                                                                                        onChange={handleEmailInputChange}
                                                                                        onFocus={() => { setEmailError('') }}
                                                                                    />
                                                                                    {emailError && <div className='text-danger'>{emailError}</div>}
                                                                                    <h6>Phone Number</h6>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control mb-3"
                                                                                        placeholder="Phone Number"
                                                                                        value={Contact}
                                                                                        onChange={handleconstactInputChange}
                                                                                        onFocus={() => { setContactError('') }}
                                                                                    />
                                                                                    {contactError && <div className='text-danger'>{contactError}</div>}
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-12">
                                                                                <div className="card">
                                                                                    <div className="card-body">
                                                                                        <h5 className="card-title">Payment</h5>
                                                                                        <p className="card-text">Please enter your credit card details below</p>
                                                                                        <input type="text" className="form-control mb-3" value={cardNumber}
                                                                                            onChange={handleCardNumberChange}
                                                                                            maxLength="19"
                                                                                            placeholder="Card Number"
                                                                                            onFocus={() => { setCardError('') }}
                                                                                            required />
                                                                                        <input type="text" className="form-control mb-3" value={cardName}
                                                                                            placeholder="Name on Card"
                                                                                            onChange={handleCardNameChange}
                                                                                            onFocus={() => { setCardError('') }}
                                                                                            required />

                                                                                        <input type="text" className="form-control mb-3"
                                                                                            onChange={handleExpiryChange}
                                                                                            maxLength="5"
                                                                                            placeholder="MM/YY"
                                                                                            onFocus={() => { setCardError('') }}
                                                                                            required />
                                                                                        <input type="text" className="form-control mb-3"
                                                                                            placeholder="CVV"
                                                                                            value={cvv}
                                                                                            onChange={handleCvvChange}
                                                                                            maxLength="3"
                                                                                            onFocus={() => { setCardError('') }}
                                                                                            required />
                                                                                    </div>
                                                                                    {cardError && <div className='text-danger'>{cardError}</div>}
                                                                                </div>
                                                                            </div>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input mb-3"
                                                                                id="terms"
                                                                                onChange={handleAgreeChange}
                                                                                onFocus={() => { setTermsError('') }}
                                                                                required />
                                                                            <label htmlFor="terms" className="form-check-label">I agree to the terms and conditions</label>
                                                                            {termsError && <div className='text-danger'>{termsError}</div>}
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="container-fluid  my-3 p-2 border " style={{ position: 'sticky', top: '20px' }}>
                                                                                <div className='container bg-light p-2 clearfix'>
                                                                                    <h5 className='float-start'>Price Summary</h5>
                                                                                    <p className='float-end'>(People X {people})</p>
                                                                                </div>

                                                                                <div>
                                                                                    <div className="row">
                                                                                        <div className="col-8 text-start">
                                                                                            <p>Base Price<p className='fw-lighter fs-7'>(includes additional service)</p></p>
                                                                                        </div>
                                                                                        <div className="col-4 text-end">
                                                                                            <p>₹{(amadeusResponse[index].price.total - (amadeusResponse[index].price.total * 0.12)) / 2}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <hr />
                                                                                    <div className="row">
                                                                                        <div className="col-8 text-start">
                                                                                            <p>Taxes+</p>
                                                                                        </div>
                                                                                        <div className="col-4 text-end">
                                                                                            <p>₹{Math.round(amadeusResponse[index].price.total * 0.12)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <hr />
                                                                                    < div className="row">
                                                                                        <div className="col-8 text-start">
                                                                                            <p>Total Price</p>
                                                                                        </div>
                                                                                        <div className="col-4 text-end">
                                                                                            <p>₹{amadeusResponse[index].price.total}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>


                                                                )}

                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                                                                <Button variant="primary" type='submit' onClick={handleBooking}>Book</Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                        {/* create second modal where i can display the ticket confirmation details and download button for the ticket */}
                                                        <Modal show={showTicketModal} onHide={handleTicketClose} size="lg" backdrop="static" centered>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Booking Confirmation</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <div className="container-fluid">
                                                                    <h5>Booking Details</h5>
                                                                    <p>Tickt has been sent to your mail Id.<br />You can also download the ticket anytime in MyBookings</p>

                                                                    <p>Booking ID: {confirmationId}</p>
                                                                    <p>Booking Date: {bookingDate}</p>
                                                                    <Button variant="primary" onClick={handleTicketDownload}>
                                                                        Download Ticket
                                                                    </Button>
                                                                </div>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="secondary" onClick={handleTicketClose}>Close</Button>
                                                            </Modal.Footer>
                                                        </Modal>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                    {amadeusResponse && numToShow < Object.values(amadeusResponse).length &&
                        <button onClick={handleShowMore}>Show More</button>
                    }
                    {/* OpenAI Response */}
                    {loading && (
                        <button className="btn btn-primary m-4 p-2" type="button" disabled>
                            <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                            Trip Loading...
                        </button>
                    )}

                    {openAiResponse ? (
                        <div className="container my-3  w-100 bg-white border border-rounded text-start">
                            <h1> Amazing {days} Days Itinerary for {destination}</h1>
                            <div><button className="btn btn-primary" onClick={shareItinerary} >
                                <FontAwesomeIcon icon={faShare} className="me-2" />
                                Share Itinerary
                            </button>
                            </div>
                            <hr />
                            <div className='row'>
                                <div className='col-8'>
                                    <div className="container mx-auto my-3 w-100 bg-light" style={{ textAlign: 'left' }}>
                                        {/* create sub title as Trip itienary */}
                                        <h2>Flight Itienary</h2>
                                        <p>
                                            {openAiResponse.choices[0].text.split('\n').map((item, i) => (
                                                <React.Fragment key={i}>
                                                    {item}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    </div>
                                </div>

                                <div className='col-4'>
                                    {openAiResponse && !pointOfInterest ?
                                        <>
                                            <h2>
                                                Point of Interest
                                            </h2>
                                            <button className="btn btn-primary m-4 p-2" type="button" disabled>
                                                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                Extracting Locations from the Itienary...
                                            </button>
                                        </>
                                        : null}
                                    {pointOfInterest ?

                                        <div className="container mx-auto my-3 w-85 bg-light" style={{ position: 'sticky', top: '20px' }}>
                                            {/* create sub title as Trip itienary */}
                                            <h2>
                                                Point of interest
                                            </h2>
                                            <ul>
                                                {pointOfInterest.map(point => (
                                                    <li key={point.pointOfInterest}>
                                                        <a href={point.link} target="_blank" rel="noopener noreferrer">{point.pointOfInterest}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        : null}
                                </div>
                            </div>

                        </div>
                    ) : null}

               

        </div>

    );
}

export default Home;