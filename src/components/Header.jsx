import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const Header = () => {
  return (
    <header className='fixed-top'>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            RoxilerDashboard
          </Navbar.Brand>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
