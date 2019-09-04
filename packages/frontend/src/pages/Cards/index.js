import React, { useEffect, useState, memo } from 'react';
import { Container, Dropdown } from 'react-bootstrap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { arenas, names, cardsPNG } from '../src/information.json';
import images from '../src/requireAll';
import './styles.css';

export default memo(() => {
   const [cardsStatus, setCardsStatus] = useState([]);
   const [dropdownText, setDropdownText] = useState('All arenas');

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

   const select = amount => {
      const cards = images.map((_, index) => index < amount);

      localStorage.setItem('cards', JSON.stringify(cards));

      setCardsStatus(JSON.parse(localStorage.getItem('cards')));
   };

   return (
      <>
         <Header page="cards" />

         <main>
            <Container>
               <div className="d-flex justify-content-center mt-2">
                  <Dropdown
                     onSelect={e => {
                        setDropdownText(e);
                     }}
                  >
                     <Dropdown.Toggle variant="success">
                        {dropdownText}
                     </Dropdown.Toggle>

                     <Dropdown.Menu>
                        {arenas
                           .slice()
                           .reverse()
                           .map((arena, index) => (
                              <Dropdown.Item
                                 key={arena.name}
                                 as="button"
                                 title={`Select all cards of ${
                                    arenas.length - (index + 1) === 0
                                       ? 'Training Camp arena'
                                       : `arena ${arenas.length -
                                            (index + 1)} and down`
                                 }`}
                                 eventKey={
                                    // eslint-disable-next-line no-nested-ternary
                                    index === 0
                                       ? 'All arenas'
                                       : arenas.length - (index + 1) === 0
                                       ? 'Training Camp'
                                       : `Arena ${arenas.length - (index + 1)}`
                                 }
                                 onClick={() => select(arena.amount + 1)}
                              >
                                 {arenas.length - (index + 1) === 0
                                    ? 'Training Camp'
                                    : `Arena ${arenas.length - (index + 1)}`}
                              </Dropdown.Item>
                           ))}
                     </Dropdown.Menu>
                  </Dropdown>
               </div>

               <div className="mt-2 d-flex flex-wrap justify-content-center justify-content-lg-start">
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
                           width={130}
                           height={160}
                           title={names[index]}
                           src={images[index]}
                           alt={cardsPNG[index]}
                        />
                     ),
                  )}
               </div>
            </Container>
         </main>

         <Footer />
      </>
   );
});
