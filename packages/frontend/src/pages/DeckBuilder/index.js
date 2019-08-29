import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
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
            <Header page="deckr" />

            <Container>
                <div className="cards mt-2">
                    {
                        cardList.map((card, index) =>
                            <div className="float-left w-25 h-50" key={index}>
                                <img className={`card border-0 w-100 h-100 ${index > 3 ? 'mt-1' : ''}`} src={images[card]} alt={cards_png[card]} title={names[card]} />
                            </div>
                        )
                    }

                    <Button className="mt-3 float-right" onClick={generate} variant="dark">Generate</Button>
                </div>
            </Container>
        </>
    )
}

export default DeckBuilder