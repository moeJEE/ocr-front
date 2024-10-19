import React, { useState, useEffect, useCallback } from 'react';
import { Paperclip, Send, Loader, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import ScrollableFeed from 'react-scrollable-feed';
import axios from 'axios';
import Layout from './Layout';
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from './SideBar';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [readingMessage, setReadingMessage] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const fetchUserMessages = useCallback(async (chatId) => {
    if (!user || !chatId) return;

    try {
      const response = await axios.get(`http://127.0.0.1:5000/messages/${chatId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user && currentChatId) {
      fetchUserMessages(currentChatId);
    }
  }, [user, currentChatId, fetchUserMessages]);

  const speakText = (text, index) => {
    if (readingMessage === index) {
      speechSynthesis.cancel();
      setReadingMessage(null);
    } else {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setReadingMessage(null);
      speechSynthesis.speak(utterance);
      setReadingMessage(index);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR'; // Définir la langue à utiliser
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Mettre le texte reconnu dans l'input
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    window.speechSynthesis.cancel();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sendMessage = async () => {
    if (input.trim() !== '' && user) {
      const userMessage = { text: input, sender: 'user' };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);

      try {
        const response = await axios.post('http://127.0.0.1:5000/chatbot', {
          user_input: input,
          user_id: user.id,
          chat_id: currentChatId,
        });
        const botMessage = { text: response.data.response, sender: 'bot', isHtml: true };
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        setCurrentChatId(response.data.chat_id);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { text: 'Erreur lors de la communication avec le serveur.', sender: 'bot' };
        setMessages([...updatedMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChatSelect = useCallback((chatId) => {
    setCurrentChatId(chatId);
    fetchUserMessages(chatId);
  }, [fetchUserMessages]);

  return (
    <Layout>
      <div className="flex h-full">
        <Sidebar onChatSelect={handleChatSelect} />
        <div className="flex-1 flex flex-col justify-end h-full bg-white rounded-lg">
          <ScrollableFeed>
            <div className="flex-1 p-4 bg-white-100 rounded-lg flex flex-col justify-end max-w-3xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`my-2 flex items-center ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <img
                      src="/chatbot.png"
                      alt="bot"
                      className="w-6 h-6 mr-2"
                    />
                  )}
                  <div
                    className={`p-2 rounded-lg ${
                      msg.sender === 'user' ? 'bg-gray-200 text-black' : 'bg-white text-black'
                    }`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                  </div>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => speakText(msg.text, index)}
                      className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-600"
                      aria-label="Read aloud"
                    >
                      {readingMessage === index ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                  )}
                  {msg.sender === 'user' && (
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" className="ml-2" />
                    </SignedIn>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="my-2 flex items-center justify-start">
                  <img
                    src="https://img.icons8.com/material-rounded/24/000000/chatbot.png"
                    alt="bot"
                    className="w-6 h-6 mr-2"
                  />
                  <div className="p-2 rounded-lg bg-white text-black">
                    <Loader size={20} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollableFeed>

          <div className="p-4 bg-white">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-inner max-w-3xl mx-auto">
              <button
                onClick={toggleListening}
                className="text-gray-400 rounded-full p-2 mr-2"
                aria-label="Toggle microphone"
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <Paperclip size={24} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border-none rounded-full p-2 bg-gray-100 outline-none"
                placeholder="Votre message ..."
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={sendMessage}
                className="text-gray-400 rounded-full p-2"
                disabled={isLoading}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
