// create a react component that input s a textarea message then perform a fetch request to localhost:3001 gets back a response as a data.message and displays that message in the box below

import React, { useState, useEffect } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

import { Modal, Button, Dropdown } from "react-bootstrap";
import Cookies from 'js-cookie';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PopupShareModal from './tabs/sharelink';
import Home from './tabs/Home';
import MyItineraries from './tabs/MyItineraries';
import MyBookings from './tabs/MyBookings';




export function Trip(props) {

  const isLoggedIn = Cookies.get('isLoggedIn');
  const name = Cookies.get('name');
  const email = Cookies.get('email');
  const password = Cookies.get('password');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.setAttribute("data-bs-theme", "dark");
    } else {
      body.removeAttribute("data-bs-theme");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const handleLogout = () => {
    props.handleLogout();
  };
  return (
    <div className="App">

      <div className="container-fluid">
        <BrowserRouter>
          <nav className="navbar bg-body-tertiary  ">
            <div className="container-fluid ">
              <div className="row align-items-center">
                <div className="col-6">
                  <Link className="navbar-brand" to="/">Trip Planner AI</Link>
                </div>
                <div className="col-6 text-right">
                </div>
              </div>
              {/* login or registration */}

              {isLoggedIn && (
                <>

                  <div className="d-flex justify-content-end">
                    {/* <button className="btn" onClick={toggleDarkMode}>
                      {darkMode ? <FontAwesomeIcon icon={faSun} style={{ color: "#7d8aa1", }} /> : <FontAwesomeIcon icon={faMoon} style={{ color: "#7d8aa1", }} />}
                    </button> */}
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id="profile-dropdown">
                        {/* display the name using the userid stored in setUserID from mongodb  */}
                        {name}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setShowProfileModal(true)}>Profile</Dropdown.Item>
                        <Dropdown.Item ><Link className="nav-link" to="/Mybookings">My Bookings</Link></Dropdown.Item>
                        <Dropdown.Item ><Link className="nav-link" to="/MyItineraries">My Itineraries</Link></Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
                      <Modal.Header closeButton>
                        <Modal.Title>Profile</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {/* Insert profile content here */}
                        <div>
                          <label>Name:</label>
                          <div>{name}</div>
                        </div>
                        <div>
                          <label>Email:</label>
                          <div>{email}</div>
                        </div>
                        <div>
                          <label>Password:</label>
                          <div>
                            <input type={showPassword ? 'text' : 'password'} value={password} readOnly />
                            <button onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>

                        <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                  {/* ... */}
                </>
              )}
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/MyBookings" element={<MyBookings />} />
            <Route path="/MyItineraries" element={<MyItineraries />} />
            {/* <Route path="/sharelink" element={<PopupShareModal />} /> */}
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}
