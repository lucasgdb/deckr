import React from 'react';
import { Toast } from 'react-bootstrap';
import icon from './images/favicon.png';
import './styles.css';

const Container = ({ children }) => (
   <div className="position-absolute notification-container">{children}</div>
);

const Notification = ({ show, toggleToast, text }) => {
   return (
      <Toast
         className="notification position-relative"
         onClose={toggleToast}
         delay={3000}
         style={{ display: show ? 'block' : 'none' }}
         autohide
      >
         <Toast.Header>
            <img width={30} className="rounded mr-2" src={icon} alt="Deckr" />
            <strong className="mr-auto">Deckr</strong>
         </Toast.Header>

         <Toast.Body>{text}</Toast.Body>
      </Toast>
   );
};

Notification.Container = Container;

export default Notification;
