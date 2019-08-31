import React, { useEffect, useState, memo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../../services/api';
import Header from '../../components/Header';
import Deck from '../../components/Deck';
import Notification from '../../components/Notification';
import Options from '../../components/Options';
import './index.css';

const SavedDecks = memo(() => {
   const [decks, setDecks] = useState([]);
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      api.get('deck').then(response => {
         setDecks(response.data);
      });
   }, []);

   const getDecks = async () => {
      const data = await api.get('deck');

      return data;
   };

   const removeDeck = async _id => {
      await api.delete(`/deck/${_id}`);

      const data = await getDecks();

      setDecks(data.data);
   };

   return (
      <>
         <Header page='decks' />

         <Notification
            text='Link successfully copied.'
            show={copied}
            toggleToast={() => setCopied(false)}
         />

         {decks.length === 0 ? (
            <p className='no-decks'>No saved decks.</p>
         ) : (
            decks.map(deck => (
               <div key={deck._id}>
                  <Deck cards={deck.cards} />

                  <Options>
                     <Dropdown>
                        <Dropdown.Toggle className='mr-1' variant='dark'>
                           Options
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                           <Dropdown.Item
                              title='Copy Deck'
                              as={CopyToClipboard}
                              variant='dark'
                              text={deck.link}
                              onCopy={() => setCopied(true)}
                           >
                              <Button>Copy</Button>
                           </Dropdown.Item>
                        </Dropdown.Menu>
                     </Dropdown>

                     <Button
                        title='Remove Deck'
                        variant='dark'
                        onClick={() => removeDeck(deck._id)}
                     >
                        Remove
                     </Button>
                  </Options>
               </div>
            ))
         )}
      </>
   );
});

export default SavedDecks;
