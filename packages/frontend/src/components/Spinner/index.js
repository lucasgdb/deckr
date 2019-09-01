import React, { memo } from 'react';
import './index.css';

const Spinner = memo(props => {
   const { center } = props;

   return (
      <div className={center ? 'position-absolute loader-center' : ''}>
         <div className='loader' />
      </div>
   );
});

export default Spinner;
