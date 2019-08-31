import React, { useEffect } from 'react';
import Header from '../../components/Header';
import './index.css';

const About = () => {
   useEffect(() => {
      document.title = 'Deckr - About';
   }, []);

   return (
      <>
         <Header page='about' />

         <div>About page</div>
      </>
   );
};

export default About;
