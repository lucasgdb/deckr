import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './styles.css';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - Page not found';
   }, []);

   return (
      <>
         <Header />

         <main>
            <p className="information">Page not found!</p>
         </main>

         <Footer />
      </>
   );
};
