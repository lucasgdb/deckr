import React, { memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import images from '~/configs/requireAll';
import { names, cardsPNG } from '~/configs/information.json';
import './styles.css';

export default memo(({ cards }) => {
   return (
      <Row
         className="cards mt-2"
         style={{ margin: '0 auto', maxWidth: 550, height: 330 }}
      >
         {cards.map(card => (
            <Col xs={3} className="p-0 h-50" key={card.id}>
               <img
                  className="border-0 w-100 h-100"
                  style={{ background: 'transparent', userSelect: 'none' }}
                  src={images[card.card]}
                  alt={cardsPNG[card.card]}
                  title={names[card.card]}
               />
            </Col>
         ))}
      </Row>
   );
});
