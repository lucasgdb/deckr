import React from 'react';
import './styles.css';

export default ({ children }) => (
   <div className="options border border border-dark d-flex justify-content-end mt-2">
      {children}
   </div>
);
