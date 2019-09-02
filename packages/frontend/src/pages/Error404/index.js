import React, { useEffect } from 'react';
import Header from '../../components/Header';
import './styles.css';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - Page not found';
   }, []);

   return (
      <>
         <Header />

         <p className="information">Page not found!</p>
      </>
   );
};
