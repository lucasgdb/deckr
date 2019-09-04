import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './styles.css';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page="about" />

         <main>
            <p className="information">App made by Lucas Bittencourt &lt;3</p>
         </main>

         <Footer />
      </>
   );
};
