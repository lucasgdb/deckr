import React, { memo } from 'react';
import { Toast } from 'react-bootstrap';
import icon from './favicon.png';
import './index.css';

const NotificationContainer = memo(props => {
   const { children } = props;

   return (
      <div className='position-absolute notification-container'>{children}</div>
   );
});

const Notification = memo(props => {
   const { show, toggleToast, text } = props;

   return (
      <Toast
         className='notification position-relative'
         onClose={toggleToast}
         delay={3000}
         style={{ display: show ? 'block' : 'none' }}
         autohide
      >
         <Toast.Header>
            <img width={30} className='rounded mr-2' src={icon} alt='Deckr' />
            <strong className='mr-auto'>Deckr</strong>
         </Toast.Header>

         <Toast.Body>{text}</Toast.Body>
      </Toast>
   );
});

export { NotificationContainer };
export default Notification;