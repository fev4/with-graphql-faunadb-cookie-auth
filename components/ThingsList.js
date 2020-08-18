import React from 'react';
import Thing from './Thing';

export default function ThingList() {
  return (
    <div>
      <p>List of things</p>
      <ul>
        <Thing />
        <Thing />
        <Thing />
      </ul>
    </div>
  );
}
