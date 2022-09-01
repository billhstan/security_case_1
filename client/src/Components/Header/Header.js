//Header.js

import React from 'react'
import { useNavigate } from 'react-router-dom';
import {useContext,useEffect } from 'react';
import {Container,Navbar,Nav,NavDropdown} from 'react-bootstrap';
import { Context } from '../../Context/appContext';
function Header() {
	const { store, actions , setStore} = useContext(Context);
  console.log('************************');
  console.log('Header.js>>>[Started]');
  console.log('Header.js>>>Inspect the [store] variable : ', store);
  console.log('************************');
  const navigate = useNavigate();

  const handleLogout =async (e) => {
    e.preventDefault();
		console.log('Header.js>>>handleLogout>>>[Started]');
		await actions.logout();
		console.log('Header.js>>>handleLogout>>>[Finished]');    
    navigate(`/login`);
  };//End of handleLogout

return (

<div>

  <Navbar bg="light" expand="lg">
  <Container fluid>
    <Navbar.Brand href="/landing">Experiment</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="/landing">Home</Nav.Link>
        {/* This is how the authenticatedUser object which lives inside the Context API is used.   */}
        {/* If the isAuthenticated is evaluated as true, the logic renders the elements which displays */}
        {/*  menu options  viewable by the user who managed to logon.   */}
        {(store?.authenticatedUser?.isAuthenticated===true)?(<>
        <NavDropdown title="Absence log" id="basic-nav-dropdown">
          <NavDropdown.Item href="/absencelogs">Manage absence logs</NavDropdown.Item>
          <NavDropdown.Item href="/absencelogs/add">Add absence log</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action/3.4">Internship absentism rules</NavDropdown.Item>
        </NavDropdown></>
        ):''}
      </Nav>
      <label className="d-flex">{store?.authenticatedUser?.fullName}</label>
      <Nav>
    {(!store?.authenticatedUser?.isAuthenticated)?(<>
      <Nav.Link eventKey={2} href="/login">Login
      </Nav.Link></>
     ) :(<><Nav.Link onClick={handleLogout} href="#">
        Logout
      </Nav.Link></>  )
    }
    </Nav>
    </Navbar.Collapse>
  </Container>
  </Navbar>
</div>

);
}

export default Header