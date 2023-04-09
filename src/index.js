import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Trip } from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/js/bootstrap.bundle.min";
import { HomePage } from './practise';
import Cookies from 'js-cookie';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // console.log(isLoggedIn);
  const [userid, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errormessage, setErrorMessage] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  

  useEffect(() => {
    const loggedInCookie = Cookies.get('isLoggedIn');
    if (loggedInCookie === 'true') {
      setIsLoggedIn(true);
      const emailCookie = Cookies.get('email');
      const nameCookie = Cookies.get('name');
      const passwordCookie = Cookies.get('password');
      setEmail(emailCookie);
      setName(nameCookie);
      setPassword(passwordCookie);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const res = await response.json();

      if (res.status === 'success') {
        setShowModal(false);

        setUserId(res.userID);
        setName(res.name);
        setEmail(res.email);
        setPassword(res.password);
        setIsLoggedIn(true);
        Cookies.set('isLoggedIn', true);
        Cookies.set('email', res.email);
        Cookies.set('name', res.name);
        Cookies.set('password', res.password);
      } else {
        setErrorMessage(res.status);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleRegister = async (e2) => {
    e2.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, })
      });
      const data = await response.json();
      console.log(data);
      if (data.status === 'success') {
        setShowModal(false);
       
        Cookies.set('email', data.email);
        Cookies.set('name', data.name);
        Cookies.set('password', data.password);
        Cookies.set('isLoggedIn', true);
      } else {
        // handle error
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    Cookies.remove('isLoggedIn');
    Cookies.remove('email');
    Cookies.remove('name');
    Cookies.remove('password');
  };
  return (
    <React.StrictMode>
      {isLoggedIn ? (
        <Trip
          userid={userid}
          name={name}
          email={email}
          password={password}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          handleLogout={handleLogout}
          
        />
      ) : (
        <HomePage
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          showModal={showModal}
          setShowModal={setShowModal}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          errormessage={errormessage}
        />
      )}
    </React.StrictMode>
  );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);