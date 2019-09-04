import React from 'react';
import './styles.css';

const Spinner = ({ center }) => (
   <div className={center ? 'position-absolute loader-center' : ''}>
      <div className="loader" />
   </div>
);

export default Spinner;
