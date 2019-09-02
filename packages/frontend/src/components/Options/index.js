import React, { memo } from 'react';
import './styles.css';

const Options = memo(({ children }) => (
   <div className="options border border border-dark d-flex justify-content-end mt-2">
      {children}
   </div>
));

export default Options;
