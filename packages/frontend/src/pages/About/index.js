import React, { useEffect, memo } from 'react';
import Header from '../../components/Header';
import './index.css';

const About = memo(() => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page='about' />

         <div>About page</div>
      </>
   );
});

export default About;
