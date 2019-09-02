/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import {
   InputGroup,
   FormControl,
   Container,
   Row,
   Col,
   Button,
} from 'react-bootstrap';
import api from '../../services/api';
import Header from '../../components/Header';
import './styles.css';

const chestsPNG = {
   wooden: require('../../chests/wooden.png'),
   silver: require('../../chests/silver.png'),
   golden: require('../../chests/golden.png'),
   giant: require('../../chests/giant.png'),
   epic: require('../../chests/epic.png'),
   magical: require('../../chests/magical.png'),
   legendary: require('../../chests/legendary.png'),
   megaLightning: require('../../chests/megaLightning.png'),
};

export default () => {
   const [userID, setUserID] = useState('');
   const [chests, setChests] = useState([]);
   const [connecting, setConnecting] = useState(false);

   useEffect(() => {
      document.title = 'Deckr - Next Chests';
   }, []);

   const connect = async () => {
      if (userID.length > 6) {
         setConnecting(true);

         try {
            const { data } = await api.get(`/chests/${userID}`);

            setChests(data);
         } finally {
            setConnecting(false);
         }
      }
   };

   const handleInput = event => {
      setUserID(
         event.target.value
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, ''),
      );
   };

   return (
      <>
         <Header page="next" />

         <Container className="mt-2">
            <Row className="justify-content-center">
               <Col xs={12} md={8} lg={6}>
                  <InputGroup>
                     <InputGroup.Prepend>
                        <InputGroup.Text>#</InputGroup.Text>
                     </InputGroup.Prepend>

                     <FormControl
                        value={userID}
                        onChange={handleInput}
                        onKeyUp={event => {
                           if (event.which === 13) connect();
                        }}
                        placeholder="User ID (e.g: C8Q2QR08)"
                     />

                     <Button
                        title="Connect to API"
                        disabled={connecting}
                        onClick={connect}
                        className="ml-1"
                     >
                        {connecting ? 'Connecting...' : 'Connect'}
                     </Button>
                  </InputGroup>
               </Col>
            </Row>

            <div className="mt-2 d-flex flex-wrap justify-content-center">
               {chests.map(chest => (
                  <div key={chest.id} className="mt-2 position-relative">
                     <img
                        title={`${chest.chest} chest`}
                        className="chest-image"
                        width={150}
                        height={150}
                        src={chestsPNG[chest.chest]}
                        alt={chest.chest}
                     />
                     <p
                        title={`${chest.chest} chest`}
                        className="chest-id position-absolute"
                     >
                        {chest.id}
                     </p>
                  </div>
               ))}
            </div>
         </Container>
      </>
   );
};
