import React, { useEffect } from 'react';
import Header from '../../components/Header';
import './styles.css';

export default () => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page="about" />

         <p className="information">App made by Lucas Bittencourt &lt;3</p>
      </>
   );
};
