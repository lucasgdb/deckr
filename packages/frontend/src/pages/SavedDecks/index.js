import React, { useEffect, useState, memo } from 'react';
import { Button } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../../services/api';
import Header from '../../components/Header';
import Deck from '../../components/Deck';
import Notification, {
   NotificationContainer,
} from '../../components/Notification';
import Spinner from '../../components/Spinner';
import Options from '../../components/Options';
import './index.css';

const SavedDecks = memo(() => {
   const [decks, setDecks] = useState([]);
   const [copied, setCopied] = useState(false);
   const [downloading, setDownloading] = useState(true);

   useEffect(() => {
      document.title = 'Deckr - Saved Decks';

      api.get('/decks').then(response => {
         setDecks(response.data);
      });
   }, []);

   useEffect(() => {
      setDownloading(false);
   }, [decks]);

   const getDecks = async () => {
      const data = await api.get('/decks');

      return data;
   };

   const removeDeck = async _id => {
      await api.delete(`/decks/${_id}`);

      const data = await getDecks();

      setDecks(data.data);
   };

   const open = link => {
      if (window.innerWidth < 993) {
         const cards = link.split('?deck=')[1];
         window.open(`clashroyale://copyDeck?deck=${cards}`);
      } else window.open(link);
   };

   return (
      <>
         <Header page='decks' />
         <NotificationContainer>
            <Notification
               text='Link successfully copied.'
               show={copied}
               toggleToast={() => setCopied(false)}
            />
         </NotificationContainer>

         {/* eslint-disable-next-line no-nested-ternary */}
         {downloading ? (
            <Spinner />
         ) : (
            <>
               <p className='information'>{decks.length} saved Decks</p>
               {decks.map(deck => (
                  <div key={deck._id}>
                     <Deck cards={deck.cards} />

                     <Options>
                        <Button
                           className='mr-1'
                           title='Open Deck on Clash Royale'
                           variant='dark'
                           onClick={() => open(deck.link)}
                        >
                           Open
                        </Button>

                        <CopyToClipboard
                           className='mr-1'
                           title='Copy Deck'
                           text={deck.link}
                           onCopy={() => setCopied(true)}
                        >
                           <Button>Copy</Button>
                        </CopyToClipboard>

                        <Button
                           title='Remove Deck'
                           variant='danger'
                           onClick={() => removeDeck(deck._id)}
                        >
                           Remove
                        </Button>
                     </Options>
                  </div>
               ))}
            </>
         )}
      </>
   );
});

export default SavedDecks;
