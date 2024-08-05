// src/components/Chat.js
import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import ScrollableFeed from 'react-scrollable-feed'
import axios from 'axios';  // Assurez-vous d'avoir installé axios avec `npm install axios`

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() !== '') {
      const userMessage = { text: input, sender: 'user' };
      setMessages([...messages, userMessage]);
      
      try {
        const response = await axios.post('http://127.0.0.1:5000/chatbot', { user_input: input });
        const botMessage = { text: response.data.response, sender: 'bot', isHtml: true };
        setMessages([...messages, userMessage, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { text: 'Erreur lors de la communication avec le serveur.', sender: 'bot' };
        setMessages([...messages, userMessage, errorMessage]);
      }

      setInput('');
    }
  };

  return (
    <div className="flex flex-col justify-end h-full bg-white rounded-lg ">

      <ScrollableFeed>
      <div className="flex-1 p-4 bg-white-100 rounded-lg flex flex-col justify-end max-w-3xl mx-auto w-full
">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-2 p-2 rounded-lg flex items-center ${
              msg.sender === 'user' ? 'bg-gray-200 text-black self-end' : 'bg-white text-black self-start'
            }`}
            style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.sender === 'bot' && (
              <img
                src="https://img.icons8.com/material-rounded/24/000000/chatbot.png"
                alt="bot"
                className="w-6 h-6 mr-2"
              />
            )}
            <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
          </div>
        ))}
      </div>
      </ScrollableFeed>

      <div className="p-4 bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-inner max-w-3xl mx-auto">
          <Paperclip size={24} className="text-gray-400 mr-2" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border-none rounded-full p-2 bg-gray-100 outline-none"
            placeholder="Message ChatGPT"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={sendMessage}
            className="text-gray-400 rounded-full p-2"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
