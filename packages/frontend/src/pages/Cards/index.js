/* eslint-disable global-require */
import React, { useEffect, useState, memo } from 'react';
import { Container, Dropdown } from 'react-bootstrap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
   version,
   arenas,
   names,
   cardsPNG,
} from '../../configs/information.json';
import images from '../../configs/requireAll';
import './styles.css';

const arenasPNG = {
   training_camp: require('../../images/arenas/training_camp.png'),
   goblin_stadium: require('../../images/arenas/goblin_stadium.png'),
   bone_pit: require('../../images/arenas/bone_pit.png'),
   barbarian_bowl: require('../../images/arenas/barbarian_bowl.png'),
   pekka_playhouse: require('../../images/arenas/pekka_playhouse.png'),
   spell_valley: require('../../images/arenas/spell_valley.png'),
   builder_workshop: require('../../images/arenas/builder_workshop.png'),
   royal_arena: require('../../images/arenas/royal_arena.png'),
   frozen_peak: require('../../images/arenas/frozen_peak.png'),
   jungle_arena: require('../../images/arenas/jungle_arena.png'),
   hog_mountain: require('../../images/arenas/hog_mountain.png'),
   electro_valley: require('../../images/arenas/electro_valley.png'),
   spooky_town: require('../../images/arenas/spooky_town.png'),
   legendary_arena: require('../../images/arenas/legendary_arena.png'),
};

export default memo(() => {
   const [cardsStatus, setCardsStatus] = useState([]);
   const [dropdownText, setDropdownText] = useState('All arenas');
   const [selectedIndex, setSelectedIndex] = useState(0);

   useEffect(() => {
      document.title = 'Deckr - Cards';

      const correctVersion =
         Number(localStorage.getItem('version')) === version;

      const gotCards = localStorage.getItem('cards');
      const parsedGotCards = JSON.parse(gotCards);

      if (gotCards && correctVersion) {
         if (parsedGotCards.length === images.length)
            setCardsStatus(parsedGotCards);
         else {
            for (let i = parsedGotCards.length; i < images.length; i += 1) {
               parsedGotCards.push(false);
            }

            localStorage.setItem('cards', JSON.stringify(parsedGotCards));
            setCardsStatus(parsedGotCards);
         }
      } else {
         const cards = images.map(() => true);

         localStorage.setItem('cards', JSON.stringify(cards));
         localStorage.setItem('version', version);

         setCardsStatus(cards);
      }
   }, []);

   const setCardStatus = index => {
      const storedStatus = [...cardsStatus];

      storedStatus[index] = !storedStatus[index];

      localStorage.setItem('cards', JSON.stringify(storedStatus));

      setCardsStatus(storedStatus);
   };

   const select = amount => {
      const cards = images.map((_, index) => index < amount);

      localStorage.setItem('cards', JSON.stringify(cards));

      setCardsStatus(cards);
   };

   return (
      <>
         <Header page="cards" />

         <main>
            <div className="d-flex justify-content-center mt-2 mb-2">
               <Dropdown
                  onSelect={e => {
                     setDropdownText(e);
                  }}
               >
                  <Dropdown.Toggle title={dropdownText} variant="success">
                     {dropdownText}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                     {arenas
                        .slice()
                        .reverse()
                        .map((arena, index) => (
                           <Dropdown.Item
                              active={index === selectedIndex}
                              key={arena.name}
                              as="button"
                              onClick={() => select(arena.amount + 1)}
                              onSelect={() => setSelectedIndex(index)}
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
                                    ? 'Arena Training Camp'
                                    : `Arena ${
                                         arena.extensible_name
                                      } (${arenas.length - (index + 1)})`
                              }
                           >
                              {arenas.length - (index + 1) === 0
                                 ? 'Training Camp'
                                 : `Arena ${arenas.length - (index + 1)}`}
                           </Dropdown.Item>
                        ))}
                  </Dropdown.Menu>
               </Dropdown>
            </div>

            {arenas.map((arena, index, array) => (
               <div key={arena.name} className="bg-dark">
                  <div style={{ backgroundColor: '#343a40', height: 170 }}>
                     <Container className="d-flex align-items-center">
                        {/* eslint-disable-next-line */}
                        <img
                           onClick={() => {
                              select(arena.amount + 1);
                           }}
                           className="arena-img"
                           style={{ cursor: 'pointer' }}
                           width={150}
                           src={arenasPNG[arena.name]}
                           alt={arena.name}
                           title={arena.extensible_name}
                        />

                        <div className="ml-2">
                           <p
                              className="m-0 text-light"
                              style={{ fontSize: 35 }}
                           >
                              {arena.extensible_name}
                              {index === 0 ? '' : ` (${index})`}
                           </p>

                           <span className="text-secondary">
                              Tap the Card to disable and enable it.
                           </span>
                        </div>
                     </Container>
                  </div>

                  <div className="pt-2 pb-2 bg-light">
                     <Container className="d-flex flex-wrap">
                        {cardsPNG
                           .slice(
                              array[index - 1] === undefined
                                 ? 1
                                 : array[index - 1].amount + 1,
                              arena.amount + 1,
                           )
                           .map((cardPNG, sIndex) => (
                              // eslint-disable-next-line
                              <img
                                 loading="lazy"
                                 key={cardPNG}
                                 width={100}
                                 height={125}
                                 alt={cardPNG}
                                 style={{
                                    userSelect: 'none',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                 }}
                                 onClick={() =>
                                    setCardStatus(
                                       array[index - 1] === undefined
                                          ? sIndex + 1
                                          : array[index - 1].amount +
                                               sIndex +
                                               1,
                                    )
                                 }
                                 className={
                                    cardsStatus[
                                       array[index - 1] === undefined
                                          ? sIndex + 1
                                          : array[index - 1].amount + sIndex + 1
                                    ] === true
                                       ? ''
                                       : 'grey'
                                 }
                                 title={
                                    names[
                                       array[index - 1] === undefined
                                          ? sIndex + 1
                                          : array[index - 1].amount + sIndex + 1
                                    ]
                                 }
                                 src={
                                    images[
                                       array[index - 1] === undefined
                                          ? sIndex + 1
                                          : array[index - 1].amount + sIndex + 1
                                    ]
                                 }
                              />
                           ))}
                     </Container>
                  </div>
               </div>
            ))}
         </main>

         <Footer />
      </>
   );
});
