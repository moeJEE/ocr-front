import React, { useState } from 'react';
import Header from './Header';

export default function Layout({ children }) {
  const [selectedChatId] = useState(null);

  // const handleChatSelect = (chatId) => {
  //   setSelectedChatId(chatId);
  //   // Vous pouvez ajouter ici toute logique supplémentaire nécessaire lors de la sélection d'un chat
  // };

  return (
    <div className="App flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 flex flex-col overflow-hidden bg-white">
          {React.Children.map(children, child =>
            React.cloneElement(child, { selectedChatId })
          )}
        </div>
      </div>
    </div>
  );
}