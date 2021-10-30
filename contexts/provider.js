import React, { useReducer, createContext } from 'react';
import authModal from './reducers/authModal';
import authModalInitialStates from './initialStates/authModalInitialStates';

export const GlobalContext = createContext();

// main provider

export const GlobalProvider = ({ children }) => {
  const [showModalState, setShowModal] = useReducer(authModal, authModalInitialStates);

  return (
    <GlobalContext.Provider
      value={{
        showModalState,
        setShowModal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const GlobalConsumer = GlobalContext.Consumer;
