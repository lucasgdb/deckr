import React, { memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import images from '../../pages/src/requireAll';
import { names, cardsPNG } from '../../pages/src/information.json';
import './index.css';

const Deck = memo(props => {
   const { cards } = props;

   return (
      <Row className='cards mt-2'>
         {cards.map(card => (
            <Col xs={3} className='p-0 h-50' key={card.id}>
               <img
                  className='card border-0 w-100 h-100'
                  src={images[card.card]}
                  alt={cardsPNG[card.card]}
                  title={names[card.card]}
               />
            </Col>
         ))}
      </Row>
   );
});

export default Deck;
