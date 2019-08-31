import React, { useEffect, useState, memo } from 'react';
import { Button, Dropdown, Toast, Row, Col } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import icon from './favicon.png';
import Header from '../../components/Header';
import images from './src/requireAll';

import { names, cardsPNG, codes } from './src/information.json';

import './src/index.css';

const Notification = memo(props => {
   const { copied, toggleToast } = props;

   return (
      <Toast
         show={copied}
         onClose={toggleToast}
         delay={3500}
         autohide
         className='toast position-absolute'
      >
         <Toast.Header>
            <img width='30px' className='rounded mr-2' src={icon} alt='Deckr' />
            <strong className='mr-auto'>Deckr</strong>
         </Toast.Header>

         <Toast.Body>Link successfully copied.</Toast.Body>
      </Toast>
   );
});

const DeckBuilder = () => {
   const [cardList, setCardList] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
   const [copied, setCopied] = useState(false);
   const [content, setContent] = useState(
      'https://link.clashroyale.com/deck/en?deck=;;;;;;;',
   );

   useEffect(() => {
      document.title = 'Deckr - Deck Builder';
   }, []);

   useEffect(() => {
      let link =
         'https://link.clashroyale.com/deck/en?deck={};{};{};{};{};{};{};{}';

      for (let i = 0; i < cardList.length; i += 1) {
         link = link.replace('{}', codes[cardList[i]]);
      }

      setContent(link);
   }, [cardList]);

   const generate = () => {
      const generatedCards = [];

      while (generatedCards.length < 8) {
         const generatedNumber =
            Math.floor(Math.random() * (images.length - 1)) + 1;

         if (generatedCards.indexOf(generatedNumber) === -1) {
            generatedCards.push(generatedNumber);
         }
      }

      setCardList(generatedCards);
   };

   const clear = () => setCardList([0, 0, 0, 0, 0, 0, 0, 0]);

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

   return (
      <>
         <Header page='deckr' />

         <Notification copied={copied} toggleToast={() => setCopied(false)} />

         <Row className='cards mt-2'>
            {cardList.map((card, index) => (
               // eslint-disable-next-line react/no-array-index-key
               <Col xs={3} className='p-0 h-50' key={index}>
                  <img
                     className='card border-0 w-100 h-100'
                     src={images[card]}
                     alt={cardsPNG[card]}
                     title={names[card]}
                  />
               </Col>
            ))}
         </Row>

         <div className='options border border-dark d-flex justify-content-end mt-2'>
            <Dropdown>
               <Dropdown.Toggle className='mr-1' variant='dark'>
                  Options
               </Dropdown.Toggle>

               <Dropdown.Menu>
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
         </div>
      </>
   );
};

export default DeckBuilder;
