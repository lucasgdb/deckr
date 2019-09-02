import React, { useEffect, memo } from 'react';
import Header from '../../components/Header';
import './styles.css';

const Error404 = memo(() => {
   useEffect(() => {
      document.title = 'Deckr - Page not found';
   }, []);

   return (
      <>
         <Header />

         <p className="information">Page not found!</p>
      </>
   );
});

export default Error404;
