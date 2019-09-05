import React from 'react';
import './styles.css';

export default ({ center }) => (
   <div className={center ? 'position-absolute loader-center' : ''}>
      <div className="loader" />
   </div>
);
