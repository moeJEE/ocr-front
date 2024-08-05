// src/App.js
import React from 'react';
import Header from './components/Header';
import SideBar from './components/SideBar';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <div className="flex-1 p-4 flex flex-col overflow-hidden bg-white">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default App;
