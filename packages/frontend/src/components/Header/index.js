import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

const Header = props => {
    return (
        <Navbar bg="dark" variant="dark" sticky="top">
            <Link className="navbar-brand" to="/"><i className="fas fa-tools mr-1"></i>Deckr</Link>
            <Nav className="mr-auto">
                <Link className={`nav-link ${props.page === 'deckr' ? 'active' : ''}`} to="/">
                    Deck Builder
                </Link>
                <Link className={`nav-link ${props.page === 'about' ? 'active' : ''}`} to="/about">
                    About
                </Link>
                {/* <Link to="/">Pricing</Link> */}
            </Nav>
        </Navbar>
    )
}

export default Header