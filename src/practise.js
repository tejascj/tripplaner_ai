import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';


export function HomePage(props) {
  const {
    email,
    password,
    name,
    showModal,
    handleLogin,
    handleRegister,
    setShowModal,
    setShowLogin,
    setEmail,
    setPassword,
    setName,
    showLogin,
    errormessage,
  } = props;
  // console.log(showLogin);
  const handleGetStartedClick = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);
 
  
  //  handle login and create account
  
  
  // create account part
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    props.handleLogin(e);
  };
  const handleRegisterSubmit = (e1) => {
    e1.preventDefault();
    props.handleRegister(e1);
  };
  // login part
  const handleLoginClick = () => setShowLogin(true);
  const handleCreateAccountClick = () => setShowLogin(false);

  
  const heroStyle = {
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url("https://mdbootstrap.com/img/new/fluid/city/018.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyle = {
    textAlign: 'center',
    color: '#fff',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const descriptionStyle = {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  };

  const ctaButtonStyle = {
    fontSize: '1.5rem',
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    border: '2px solid #fff',
    borderRadius: '30px',
    color: '#fff',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    outline: 'none',
  };

  const ctaButtonHoverStyle = {
    backgroundColor: '#fff',
    color: '#000',
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: showModal ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const formStyle = {
    backgroundColor: '#fff',
    padding: '3rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };

  const modalCloseButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="container">
          <a className="navbar-brand">
            Trip Planner AI
          </a>
        </div>
      </nav>
      <div style={heroStyle}>
        <div style={overlayStyle}>
          <div style={contentStyle}>
            <h1 style={titleStyle}>Plan Your Dream Trip with AI</h1>
            <p style={descriptionStyle}>
              Experience stress-free trip planning with AI.
              Let our web application do the work for you, <br></br>finding the best deals on flights and create itinerary. Enjoy a personalized itinerary tailored just for you.
            </p>
            <a
              className="btn btn-outline-light btn-lg m-2"
              role="button"
              rel="nofollow"
              target="_blank"
              onClick={handleGetStartedClick}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{showLogin ? "Login" : "Create Account"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showLogin ? (
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              {/* create error message text */}
              {errormessage && 
              <Form.Group controlId="text">
                <Form.Label style={{color:'red'}}>Invalid Login Details</Form.Label>
              </Form.Group>
              }
            </Form>
          ) : (
            <Form>
              <Form.Group controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e1) => setName(e1.target.value)} />
              </Form.Group>

              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email"  value={email} onChange={(e1) => setEmail(e1.target.value)} />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password"  value={password} onChange={(e1) => setPassword(e1.target.value)}/>
              </Form.Group>

            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showLogin ? (
            <>
              <Button variant="link" onClick={handleCreateAccountClick}>
                Create New Account
              </Button>
              <Button variant="primary" onClick={handleLoginSubmit}>
                Login
              </Button>

            </>
          ) : (
            <>
              <Button variant="link" onClick={handleLoginClick}>
                Already have an account? Login
              </Button>
              <Button variant="primary" onClick={handleRegisterSubmit}>
                Create Account
              </Button>

            </>
          )}
        </Modal.Footer>
      </Modal>

    </div>
  );
}


