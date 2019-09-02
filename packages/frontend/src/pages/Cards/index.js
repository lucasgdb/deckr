import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import Header from '../../components/Header';
import { names, cardsPNG } from '../src/information.json';
import images from '../src/requireAll';
import './styles.css';

export default () => {
   const [cardsStatus, setCardsStatus] = useState([]);

   useEffect(() => {
      document.title = 'Deckr - Cards';

      if (!localStorage.getItem('cards')) {
         const cards = images.map(() => true);
         localStorage.setItem('cards', JSON.stringify(cards));
      }

      setCardsStatus(JSON.parse(localStorage.getItem('cards')));
   }, []);

   const setCardStatus = index => {
      const storedStatus = [...cardsStatus];

      storedStatus[index] = storedStatus[index] === false;

      localStorage.setItem('cards', JSON.stringify(storedStatus));

      setCardsStatus(JSON.parse(localStorage.getItem('cards')));
   };

   const selectAll = () => {
      const cards = images.map(() => true);
      localStorage.setItem('cards', JSON.stringify(cards));

      setCardsStatus(JSON.parse(localStorage.getItem('cards')));
   };

   return (
      <>
         <Header page="cards" />

         <Container>
            <div
               title="Select all Cards"
               className="d-flex justify-content-center mt-2"
            >
               <Button onClick={selectAll}>Select all Cards</Button>
            </div>

            <div className="mt-2 d-flex flex-wrap justify-content-center">
               {cardsStatus.map((status, index) =>
                  index === 0 ? (
                     ''
                  ) : (
                     // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                     <img
                        onClick={() => setCardStatus(index)}
                        onKeyDown={() => {}}
                        className={`card ${status === true ? '' : 'grey'}`}
                        key={cardsPNG[index]}
                        width={150}
                        height={180}
                        title={names[index]}
                        src={images[index]}
                        alt={cardsPNG[index]}
                     />
                  ),
               )}
            </div>
         </Container>
      </>
   );
};
