import React, { useEffect, useState, useCallback, memo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../../services/api';
import Header from '../../components/Header';
import Deck from '../../components/Deck';
import Notification from '../../components/Notification';
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
   const [cardList, setCardList] = useState(defaultCardList);
   const [copied, setCopied] = useState(false);
   const [saved, setSaved] = useState(false);
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
      await api.post('/deck', {
         cards: cardList,
         link: getLink(),
      });

      setSaved(true);
   };

   return (
      <>
         <Header page='deckr' />

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
                     title='Copy Deck'
                     as={CopyToClipboard}
                     variant='dark'
                     text={content}
                     onCopy={() => setCopied(true)}
                  >
                     <Button>Copy</Button>
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

            <Button title='Generate Deck' variant='dark' onClick={generate}>
               Generate
            </Button>
         </Options>
      </>
   );
});

export default DeckBuilder;
