import React from 'react';
import { FaTools } from 'react-icons/fa';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

const Header = ({ page }) => {
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
               <Link
                  title="Deck Builder"
                  className={`nav-link ${page === 'deckr' ? 'active' : ''}`}
                  to="/"
               >
                  Deck Builder
               </Link>

               <Link
                  title="Cards"
                  className={`nav-link ${page === 'cards' ? 'active' : ''}`}
                  to="/cards"
               >
                  Cards
               </Link>

               <Link
                  title="Saved Decks"
                  className={`nav-link ${page === 'decks' ? 'active' : ''}`}
                  to="/decks"
               >
                  Saved Decks
               </Link>

               <Link
                  title="Next Chests"
                  className={`nav-link ${page === 'next' ? 'active' : ''}`}
                  to="/next"
               >
                  Next Chests
               </Link>

               <Link
                  title="About"
                  className={`nav-link ${page === 'about' ? 'active' : ''}`}
                  to="/about"
               >
                  About
               </Link>
            </Nav>
         </Navbar.Collapse>
      </Navbar>
   );
};

export default Header;
