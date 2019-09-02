import React, { useEffect, memo } from 'react';
import Header from '../../components/Header';
import './styles.css';

const About = memo(() => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page="about" />

         <p className="information">App made by Lucas Bittencourt &lt;3</p>
      </>
   );
});

export default About;
