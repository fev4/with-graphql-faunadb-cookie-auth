import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [id, setId] = useState('');
  return (
    <UserContext.Provider value={{ id, setId }}>
      {children}
    </UserContext.Provider>
  );
};

export const user = () => useContext(UserContext);
