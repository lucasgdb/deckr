import React, { useEffect, useState, memo } from 'react'
import icon from './favicon.png'
import Header from '../../components/Header'
import images from './src/requireAll'

import {
    Button,
    Container,
    Dropdown,
    ButtonGroup,
    Toast
} from 'react-bootstrap'

import {
    names,
    cards_png,
    codes
} from './src/information.json'

import { CopyToClipboard } from 'react-copy-to-clipboard'

import './src/index.css'

const Notification = memo(props => {
    return (
        <Toast show={props.copied} onClose={props.toggleToast} delay={3500} autohide className="toast position-absolute">
            <Toast.Header>
                <img width="30px" className="rounded mr-2" src={icon} alt="Deckr" />
                <strong className="mr-auto">Deckr</strong>
            </Toast.Header>

            <Toast.Body>Link successfully copied.</Toast.Body>
        </Toast>
    )
})

const DeckBuilder = () => {
    const [cardList, setCardList] = useState([0, 0, 0, 0, 0, 0, 0, 0])
    const [content, setContent] = useState('https://link.clashroyale.com/deck/en?deck=;;;;;;;')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        document.title = 'Deckr - Deck Builder'
    }, [])

    useEffect(() => {
        let link = 'https://link.clashroyale.com/deck/en?deck={};{};{};{};{};{};{};{}'

        for (let i = 0; i < cardList.length; i++) link = link.replace('{}', codes[cardList[i]])

        setContent(link)
    }, [cardList])

    const generate = () => {
        const generatedCards = []

        while (generatedCards.length < 8) {
            const generatedNumber = Math.floor(Math.random() * (images.length - 1)) + 1

            if (generatedCards.indexOf(generatedNumber) === -1) generatedCards.push(generatedNumber)
        }

        setCardList(generatedCards)
    }

    const clear = () => { setCardList([0, 0, 0, 0, 0, 0, 0, 0]) }

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

            <Notification copied={copied} toggleToast={() => setCopied(false)} />

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
                    <CopyToClipboard text={content} onCopy={() => setCopied(true)}>
                        <Button className="mr-1" title="Copy Deck" variant="dark">Copy</Button>
                    </CopyToClipboard>

                    <Dropdown drop={window.innerWidth < 768 ? 'left' : 'down'} as={ButtonGroup}>
                        <Button title="Generate Deck" variant="dark" onClick={generate}>Generate</Button>

                        <Dropdown.Toggle split variant="dark" />

                        <Dropdown.Menu>
                            <Dropdown.Item title="Clear Deck" onClick={clear}>Clear</Dropdown.Item>
                            <Dropdown.Item title="Shuffle Deck" onClick={shuffle}>Shuffe</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Container>
        </>
    )
}

export default DeckBuilder