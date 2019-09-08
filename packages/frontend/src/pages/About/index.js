import React, { useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import lucas from './images/lucas_bittencourt.jpg';
import './styles.css';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page="about" />

         <main>
            <Container className="mt-2">
               <Card body>
                  <p className="text-center mb-0">
                     App made by Lucas Bittencourt &lt;3
                  </p>
               </Card>

               <Row>
                  <Col md={4} className="pr-md-1">
                     <Card body className="mt-2">
                        <Card.Img
                           title="Lucas Bittencourt"
                           src={lucas}
                           className="img-thumbnail img-fluid"
                           alt="Lucas Bittencourt"
                        />

                        <Card.Title
                           className="text-center pb-0 m-0"
                           style={{
                              fontSize: 22,
                              paddingTop: 20,
                           }}
                        >
                           Lucas Bittencourt
                        </Card.Title>
                     </Card>
                  </Col>

                  <Col md={8} className="pl-md-1">
                     <Card body className="card-about mt-2">
                        <Card.Title
                           className="text-center"
                           style={{
                              fontSize: 30,
                              paddingBottom: 0,
                              margin: 0,
                           }}
                        >
                           <FaInfoCircle
                              className="position-relative mr-2"
                              style={{ top: -2 }}
                           />
                           About
                        </Card.Title>

                        <Card.Text className="mt-2">
                           Hi. My name is Lucas Bittencourt (also known as
                           lucasnaja). I am a System Analysis and Development
                           student. I am learning React.js & Node.js for myself
                           improvement. My GitHub is:{' '}
                           <a
                              href="https://github.com/lucasnaja"
                              target="_blank"
                              rel="noopener noreferrer"
                           >
                              https://github.com/lucasnaja
                           </a>
                           . This project was made using React.js, Node.js and
                           MongoDB. Deckr is a Deck Builder and Manager for
                           Clash Royale. Have fun :)
                        </Card.Text>
                     </Card>
                  </Col>
               </Row>
            </Container>
         </main>

         <Footer />
      </>
   );
};
