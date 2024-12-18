import React, { useState } from 'react';
import Header from './Header';

export default function Layout({ children }) {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    // Additional logic can be added here as needed
  };

  return (
    <div className="App flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 flex flex-col overflow-hidden bg-white">
          {/* Example chat selection */}
          <div className="chat-list">
            {/* Replace with your actual chat data */}
            {[1, 2, 3].map(chatId => (
              <button key={chatId} onClick={() => handleChatSelect(chatId)}>
                Chat {chatId}
              </button>
            ))}
          </div>
          
          {React.Children.map(children, child =>
            React.cloneElement(child, { selectedChatId })
          )}
        </div>
      </div>
    </div>
  );
}