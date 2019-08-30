import React, { memo } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

const Header = memo(props => {
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
            <Link className="navbar-brand" to="/">
                <i className="fas fa-tools mr-1"></i>
                Deckr
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <Link className={`nav-link ${props.page === 'deckr' ? 'active' : ''}`} to="/">Deck Builder</Link>
                    <Link className={`nav-link ${props.page === 'about' ? 'active' : ''}`} to="/about">About</Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
})

export default Header