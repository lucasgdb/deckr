import React, { useEffect } from 'react'
import './index.css'

const About = () => {
    useEffect(() => document.title = 'Deckr - About', [])

    return (
        <div>
            Página de Sobre
        </div>
    )
}

export default About