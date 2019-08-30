import React, { useEffect } from 'react'
import Header from '../../components/Header'
import './index.css'

const Error404 = () => {
    useEffect(() => {
        document.title = 'Deckr - Page not found'
    }, [])

    return (
        <>
            <Header />

            <p>Page not found!</p>
        </>
    )
}

export default Error404