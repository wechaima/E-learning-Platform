import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon } from '@heroicons/react/outline';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-container">
      <button 
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <ChevronDownIcon className={`accordion-icon ${isOpen ? 'open' : ''}`} />
        <span className="accordion-title">{title}</span>
      </button>
      
      <div 
        className={`accordion-content ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
};

export default Accordion;