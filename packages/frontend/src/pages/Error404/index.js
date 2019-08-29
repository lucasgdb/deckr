import React, { useEffect } from 'react'
import './index.css'

const Error404 = () => {
    useEffect(() => document.title = 'Deckr - Page not found', [])

    return <div>Página de Erro</div>
}

export default Error404