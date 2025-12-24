import React from 'react';
import DeletableEdge from './DeletableEdge';

export default function ErrorEdge(props) {
  return (
    <DeletableEdge
      {...props}
      style={{ ...props.style, stroke: '#ef4444', strokeWidth: 2 }} 
      // Tailwind red-500 is #ef4444. 
    />
  );
}
