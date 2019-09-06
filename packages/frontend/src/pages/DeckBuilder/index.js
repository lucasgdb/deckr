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
import Notification from '../../components/Notification';
import Options from '../../components/Options';
import Footer from '../../components/Footer';
import images from '../src/requireEnabled';
import { version, codes } from '../src/information.json';

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

export default memo(() => {
   const txtPasteLink = useRef(null);

   const [cardList, setCardList] = useState(defaultCardList);
   const [copied, setCopied] = useState(false);
   const [saved, setSaved] = useState(false);
   const [show, setShow] = useState(false);
   const [content, setContent] = useState(
      'https://link.clashroyale.com/deck/en?deck=;;;;;;;',
   );
   const [enabledCards, setEnabledCards] = useState([0]);

   useEffect(() => {
      document.title = 'Deckr - Deck Builder';

      const correctVersion =
         JSON.parse(localStorage.getItem('version')) === version;

      if (!localStorage.getItem('cards') || !correctVersion) {
         const cards = images.map(() => true);

         localStorage.setItem('cards', JSON.stringify(cards));
         localStorage.setItem('version', version);
      }

      const cards = JSON.parse(localStorage.getItem('cards'));
      const enabled = [];

      for (let i = 1; i < cards.length; i += 1) {
         if (cards[i]) enabled.push(i);
      }

      setEnabledCards(enabled);
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

      while (
         numbers.length < (enabledCards.length < 8 ? enabledCards.length : 8)
      ) {
         const generatedNumber = Math.floor(
            Math.random() * enabledCards.length,
         );

         if (numbers.indexOf(generatedNumber) === -1) {
            numbers.push(generatedNumber);

            generatedCards.push({
               id: generatedCards.length,
               card: enabledCards[generatedNumber],
            });
         }
      }

      for (let i = numbers.length; i < 8; i += 1) {
         generatedCards.push({
            id: i,
            card: 0,
         });
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

         if (deck.length !== 8) return;

         const newDeck = [];

         for (let i = 0; i < deck.length; i += 1) {
            const index = codes.indexOf(deck[i]);
            const card = index === -1 ? 0 : index;

            newDeck.push({ id: i, card });
         }

         setCardList(newDeck);
         setShow(false);
      }
   };

   const open = () => {
      if (window.innerWidth < 993) {
         const cards = getLink().split('?deck=')[1];
         window.open(`clashroyale://copyDeck?deck=${cards}`);
      } else window.open(getLink());
   };

   return (
      <>
         <Header page="/" />

         <Notification.Container>
            <Notification
               text="Link successfully copied."
               show={copied}
               toggleToast={() => setCopied(false)}
            />

            <Notification
               text="Deck successfully saved."
               show={saved}
               toggleToast={() => setSaved(false)}
            />
         </Notification.Container>

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
                  title="Close"
                  variant="danger"
                  onClick={() => setShow(false)}
               >
                  Cancel
               </Button>

               <Button title="Paste Deck" variant="primary" onClick={paste}>
                  Paste
               </Button>
            </Modal.Footer>
         </Modal>

         <main>
            <Deck cards={cardList} />

            <Options>
               <Dropdown>
                  <Dropdown.Toggle className="mr-1" variant="dark">
                     Options
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                     <Dropdown.Item
                        as={Button}
                        variant="dark"
                        title="Open Deck"
                        onClick={open}
                     >
                        Open
                     </Dropdown.Item>

                     <Dropdown.Item
                        as={Button}
                        variant="dark"
                        title="Save Deck"
                        onClick={save}
                     >
                        Save
                     </Dropdown.Item>

                     <Dropdown.Divider />

                     <Dropdown.Item
                        as={Button}
                        variant="dark"
                        title="Paste Deck"
                        onClick={() => setShow(true)}
                     >
                        Paste
                     </Dropdown.Item>

                     <Dropdown.Item
                        as={Button}
                        variant="dark"
                        title="Clear Deck"
                        onClick={clear}
                     >
                        Clear
                     </Dropdown.Item>

                     <Dropdown.Item
                        as={Button}
                        variant="dark"
                        title="Shuffle Deck"
                        onClick={shuffle}
                     >
                        Shuffle
                     </Dropdown.Item>
                  </Dropdown.Menu>
               </Dropdown>

               <CopyToClipboard
                  className="mr-1"
                  title="Copy Deck"
                  text={content}
                  onCopy={() => setCopied(true)}
               >
                  <Button>Copy</Button>
               </CopyToClipboard>

               <Button
                  title="Generate Deck"
                  variant="success"
                  onClick={generate}
               >
                  Generate
               </Button>
            </Options>
         </main>

         <Footer />
      </>
   );
});
