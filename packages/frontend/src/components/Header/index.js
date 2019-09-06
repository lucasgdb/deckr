import React from 'react';
import { FaTools } from 'react-icons/fa';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

export default ({ page }) => {
   return (
      <Navbar
         collapseOnSelect
         expand="lg"
         bg="dark"
         variant="dark"
         sticky="top"
      >
         <Link title="Deckr" className="navbar-brand" to="/">
            <FaTools
               className="position-relative mr-2"
               style={{ marginTop: -3 }}
            />
            Deckr
         </Link>

         <Navbar.Toggle aria-controls="responsive-navbar-nav" />

         <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
               {[
                  { title: 'Deck Builder', to: '/', id: 1 },
                  { title: 'Cards', to: 'cards', id: 2 },
                  { title: 'Saved Decks', to: 'decks', id: 3 },
                  { title: 'Next Chests', to: 'next', id: 4 },
                  { title: 'About', to: 'about', id: 5 },
               ].map(link => (
                  <Link
                     key={link.id}
                     title={link.title}
                     className={`nav-link ${page === link.to ? 'active' : ''}`}
                     to={link.to}
                  >
                     {link.title}
                  </Link>
               ))}
            </Nav>
         </Navbar.Collapse>
      </Navbar>
   );
};
