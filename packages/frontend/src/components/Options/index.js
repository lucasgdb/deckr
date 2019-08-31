import React, { memo } from 'react';
import './index.css';

const Options = memo(props => {
   const { children } = props;

   return (
      <div className='options border border border-dark d-flex justify-content-end mt-2'>
         {children}
      </div>
   );
});

export default Options;
