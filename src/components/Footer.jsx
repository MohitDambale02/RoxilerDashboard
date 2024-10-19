import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white text-center py-3 fixed-bottom">
      <p className="mb-0">Copyright&copy; {currentYear} Roxiler.</p>
    </footer>
  );
};

export default Footer;
