import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import images from './src/requireAll'
import { names, cards_png } from './src/information.json'
import './src/index.css'

const DeckBuilder = () => {
    const [cardList, setCardList] = useState([0, 0, 0, 0, 0, 0, 0, 0])

    useEffect(() => {
        document.title = 'Deckr - Deck Builder'
    }, [])

    const generate = () => {
        const generatedCards = []

        while (generatedCards.length < 8) {
            const generatedNumber = Math.floor(Math.random() * 8) + 1

            if (generatedCards.indexOf(generatedNumber) === -1) generatedCards.push(generatedNumber)
        }

        setCardList(generatedCards)
    }

    return (
        <>
            <div className="cards">
                {
                    cardList.map((card, index) =>
                        <div className="card-container" key={index}>
                            <img className={`card ${index > 3 ? 'mt-1' : ''}`} src={images[card]} alt={cards_png[card]} title={names[card]} />
                        </div>
                    )
                }
            </div>

            <Button onClick={generate}>Generate</Button>
        </>
    )
}

export default DeckBuilder