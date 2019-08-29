import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import images from './src/requireAll'

import {
    Button,
    Container,
    Dropdown,
    ButtonGroup
} from 'react-bootstrap'

import {
    names,
    cards_png
} from './src/information.json'

import './src/index.css'

const DeckBuilder = () => {
    const [cardList, setCardList] = useState([0, 0, 0, 0, 0, 0, 0, 0])

    useEffect(() => {
        document.title = 'Deckr - Deck Builder'
    }, [])

    const generate = () => {
        const generatedCards = []

        while (generatedCards.length < 8) {
            const generatedNumber = Math.floor(Math.random() * (images.length - 1)) + 1

            if (generatedCards.indexOf(generatedNumber) === -1) generatedCards.push(generatedNumber)
        }

        setCardList(generatedCards)
    }

    const clear = () => setCardList([0, 0, 0, 0, 0, 0, 0, 0])

    const shuffle = () => {
        const
            shuffled = [],
            currentCardList = [...cardList],
            newCardList = []

        while (shuffled.length < 8) {
            const number = Math.floor(Math.random() * currentCardList.length)

            if (shuffled.indexOf(number) === -1) {
                shuffled.push(number)
                newCardList.push(currentCardList[number])
            }
        }

        setCardList(newCardList)
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
                </div>

                <div className="options border border-dark d-flex justify-content-end mt-2">
                    <Dropdown drop={window.innerWidth < 768 ? 'left' : 'down'} as={ButtonGroup}>
                        <Button title="Generate Deck" variant="dark" onClick={generate}>Generate</Button>

                        <Dropdown.Toggle split variant="dark" />

                        <Dropdown.Menu>
                            <Dropdown.Item title="Clear Deck" onClick={clear}>Clear</Dropdown.Item>
                            <Dropdown.Item title="Shuffle Deck" onClick={shuffle}>Shuffe</Dropdown.Item>
                            {/* <Dropdown.Item >Something else</Dropdown.Item> */}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Container>
        </>
    )
}

export default DeckBuilder