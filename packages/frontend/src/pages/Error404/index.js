import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - Page not found';
   }, []);

   return (
      <>
         <Header />

         <main>
            <p
               style={{
                  fontSize: 30,
                  color: '#333',
                  textAlign: 'center',
                  marginBottom: 0,
               }}
            >
               Page not found!
            </p>
         </main>

         <Footer />
      </>
   );
};
