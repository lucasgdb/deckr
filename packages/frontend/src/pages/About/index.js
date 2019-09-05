import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page="about" />

         <main>
            <p
               style={{
                  fontSize: 30,
                  color: '#333',
                  textAlign: 'center',
                  marginBottom: 0,
               }}
            >
               App made by Lucas Bittencourt &lt;3
            </p>
         </main>

         <Footer />
      </>
   );
};
