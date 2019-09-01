import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
   Button,
   Dropdown,
   Modal,
   InputGroup,
   FormControl,
} from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../../services/api';
import Header from '../../components/Header';
import Deck from '../../components/Deck';
import Notification, {
   NotificationContainer,
} from '../../components/Notification';
import Options from '../../components/Options';
import { names, codes } from '../src/information.json';

const defaultCardList = [
   { id: 0, card: 0 },
   { id: 1, card: 0 },
   { id: 2, card: 0 },
   { id: 3, card: 0 },
   { id: 4, card: 0 },
   { id: 5, card: 0 },
   { id: 6, card: 0 },
   { id: 7, card: 0 },
];

const DeckBuilder = memo(() => {
   const txtPasteLink = useRef(null);

   const [cardList, setCardList] = useState(defaultCardList);
   const [copied, setCopied] = useState(false);
   const [saved, setSaved] = useState(false);
   const [show, setShow] = useState(false);
   const [content, setContent] = useState(
      'https://link.clashroyale.com/deck/en?deck=;;;;;;;',
   );

   useEffect(() => {
      document.title = 'Deckr - Deck Builder';
   }, []);

   const getLink = useCallback(() => {
      let link =
         'https://link.clashroyale.com/deck/en?deck={};{};{};{};{};{};{};{}';

      for (let i = 0; i < cardList.length; i += 1) {
         link = link.replace('{}', codes[cardList[i].card]);
      }

      return link;
   }, [cardList]);

   useEffect(() => {
      setContent(getLink());
   }, [cardList, getLink]);

   const generate = () => {
      const generatedCards = [];
      const numbers = [];

      while (numbers.length < 8) {
         const generatedNumber =
            Math.floor(Math.random() * (names.length - 1)) + 1;

         if (numbers.indexOf(generatedNumber) === -1) {
            numbers.push(generatedNumber);

            generatedCards.push({
               id: generatedCards.length,
               card: generatedNumber,
            });
         }
      }

      setCardList(generatedCards);
   };

   const clear = () => setCardList(defaultCardList);

   const shuffle = () => {
      const shuffled = [];
      const currentCardList = [...cardList];
      const newCardList = [];

      while (shuffled.length < 8) {
         const number = Math.floor(Math.random() * currentCardList.length);

         if (shuffled.indexOf(number) === -1) {
            shuffled.push(number);
            newCardList.push(currentCardList[number]);
         }
      }

      setCardList(newCardList);
   };

   const save = async () => {
      await api.post('/decks', {
         cards: cardList,
         link: getLink(),
      });

      setSaved(true);
   };

   const paste = () => {
      const pasteLink = txtPasteLink.current.value;

      if (
         pasteLink.length > 0 &&
         pasteLink.length > 42 &&
         pasteLink.includes(';')
      ) {
         const deck = pasteLink.split('?deck=')[1].split(';');
         const newDeck = [];

         if (deck.length !== 8) return;

         for (let i = 0; i < deck.length; i += 1) {
            const index = codes.indexOf(deck[i]);
            const card = index === -1 ? 0 : index;

            newDeck.push({ id: i, card });
         }

         setCardList(newDeck);
         setShow(false);
      }
   };

   return (
      <>
         <Header page='deckr' />

         <NotificationContainer>
            <Notification
               text='Link successfully copied.'
               show={copied}
               toggleToast={() => setCopied(false)}
            />

            <Notification
               text='Deck successfully saved.'
               show={saved}
               toggleToast={() => setSaved(false)}
            />
         </NotificationContainer>

         <Modal
            style={{ zIndex: 10001 }}
            show={show}
            onHide={() => setShow(false)}
         >
            <Modal.Header closeButton>
               <Modal.Title>Paste a Deck</Modal.Title>
            </Modal.Header>

            <Modal.Body>
               <InputGroup>
                  <InputGroup.Prepend>
                     <InputGroup.Text>Link</InputGroup.Text>
                  </InputGroup.Prepend>

                  <FormControl
                     ref={txtPasteLink}
                     placeholder="Paste the Deck's link here."
                  />
               </InputGroup>
            </Modal.Body>

            <Modal.Footer>
               <Button
                  title='Close'
                  variant='danger'
                  onClick={() => setShow(false)}
               >
                  Cancel
               </Button>

               <Button title='Paste Deck' variant='primary' onClick={paste}>
                  Paste
               </Button>
            </Modal.Footer>
         </Modal>

         <Deck cards={cardList} />

         <Options>
            <Dropdown>
               <Dropdown.Toggle className='mr-1' variant='dark'>
                  Options
               </Dropdown.Toggle>

               <Dropdown.Menu>
                  <Dropdown.Item
                     as={Button}
                     variant='dark'
                     title='Save Deck'
                     onClick={save}
                  >
                     Save
                  </Dropdown.Item>

                  <Dropdown.Item
                     as={Button}
                     variant='dark'
                     title='Paste Deck'
                     onClick={() => setShow(true)}
                  >
                     Paste
                  </Dropdown.Item>

                  <Dropdown.Item
                     as={Button}
                     variant='dark'
                     title='Clear Deck'
                     onClick={clear}
                  >
                     Clear
                  </Dropdown.Item>

                  <Dropdown.Item
                     as={Button}
                     variant='dark'
                     title='Shuffle Deck'
                     onClick={shuffle}
                  >
                     Shuffle
                  </Dropdown.Item>
               </Dropdown.Menu>
            </Dropdown>

            <CopyToClipboard
               className='mr-1'
               title='Copy Deck'
               text={content}
               onCopy={() => setCopied(true)}
            >
               <Button>Copy</Button>
            </CopyToClipboard>

            <Button title='Generate Deck' variant='success' onClick={generate}>
               Generate
            </Button>
         </Options>
      </>
   );
});

export default DeckBuilder;
