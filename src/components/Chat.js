import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Paperclip, Send, Loader, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import ScrollableFeed from 'react-scrollable-feed';
import axios from 'axios';
import Layout from './Layout';
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from './SideBar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [readingMessage, setReadingMessage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  // Reference to the hidden file input element
  const fileInputRef = useRef(null);

  // Function to fetch messages for the current chat
  const fetchUserMessages = useCallback(async (chatId) => {
    if (!user || !chatId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${chatId}`);
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

  // Function to start speech recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR'; // Set language to French
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Set the recognized text to the input
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

  // Function to stop speech recognition
  const stopListening = () => {
    setIsListening(false);
    window.speechSynthesis.cancel();
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (input.trim() !== '' && user) {
      const userMessage = { text: input, sender: 'user' };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);

      try {
        const response = await axios.post(`${API_BASE_URL}/messages`, {
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
  
  // Function to handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    console.log("Uploading file:", { name: file.name, type: file.type, size: file.size });
    setIsLoading(true);
  
    try {
      let chatId = currentChatId;
  
      // Étape 1: Créer un nouveau chat si inexistant
      if (!chatId) {
        const { data } = await axios.post(`${API_BASE_URL}/chat-histories`, {
          user_id: user.id,
          title: "Nouvelle Conversation",
        });
        chatId = data.chat_id;
        setCurrentChatId(chatId);
        setMessages([]);
      }
  
      // Étape 2: Ajouter un message utilisateur pour l'upload du fichier
      const fileMessage = `Fichier uploadé : ${file.name}`;
      await axios.post(`${API_BASE_URL}/messages`, {
        chat_id: chatId,
        user_id: user.id,
        content: fileMessage,
        is_user: true,
      });
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: fileMessage, sender: "user" },
        { text: "Le document est en cours de traitement OCR...", sender: "bot", isLoading: true },
      ]);
  
      // Étape 3: Upload du fichier vers Azure Blob Storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.id);
      formData.append("chat_id", chatId);
  
      const { data: uploadData } = await axios.post(`${API_BASE_URL}/uploadFile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("File upload response:", uploadData);
  
      // Extraire l'ID du fichier pour le traitement OCR
      const fileUrl = uploadData.fileUrl;
      const fileId = fileUrl.split("/").pop();
  
      // Fonction pour récupérer les résultats OCR avec un mécanisme de retry
      const fetchOCRResult = async (maxAttempts = 5, retryDelay = 3000) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const { data: ocrResponse } = await axios.get(`${API_BASE_URL}/GetOCRResult`, { params: { id: fileId } });
            const ocrText = ocrResponse.text || 'Aucun résultat OCR trouvé.';
            const ocrResultMessage = `**Résultat OCR :**\n${ocrText}`;
            await axios.post(`${API_BASE_URL}/messages`, {
              chat_id: chatId,
              user_id: user.id,
              content: ocrResultMessage,
              is_user: false,
            });
  
            // Mettre à jour les messages dans l'UI
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              updatedMessages.pop(); // Supprimer le message de chargement
              return [...updatedMessages, { text: ocrResultMessage, sender: "bot" }];
            });
  
            setIsLoading(false);
            return;
          } catch (error) {
            if (error.response?.status === 404 && attempt < maxAttempts) {
              console.warn(`Tentative ${attempt}/${maxAttempts} : Résultat OCR non prêt, nouvelle tentative dans ${retryDelay / 1000}s...`);
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            } else {
              console.error("Erreur lors de la récupération des résultats OCR :", error.message);
  
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages.pop();
                return [...updatedMessages, { text: "Erreur lors de la récupération des résultats OCR.", sender: "bot" }];
              });
  
              setIsLoading(false);
              return;
            }
          }
        }
  
        // Timeout après les tentatives échouées
        console.warn("Nombre maximal de tentatives atteint.");
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages.pop();
          return [...updatedMessages, { text: "Le résultat OCR n'est pas disponible pour le moment.", sender: "bot" }];
        });
        setIsLoading(false);
      };
  
      // Lancer la récupération des résultats OCR
      await fetchOCRResult();
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier ou du traitement OCR :", error.message);
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Erreur lors du téléchargement du fichier ou de la récupération des résultats OCR.", sender: "bot" },
      ]);
      setIsLoading(false);
    } finally {
      event.target.value = null; // Réinitialiser le champ fichier
    }
  };
  


    // Handle chat selection from Sidebar
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
                  {msg.isLoading ? (
                    <div className="flex items-center">
                      <span>{msg.text}</span>
                      <Loader size={18} className="ml-2 animate-spin" />
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                  )}
                </div>
                {msg.sender === 'bot' && !msg.isLoading && (
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
              {/* {isLoading && (
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
              )} */}
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
              <Paperclip
                size={24}
                className="text-gray-400 mr-2 cursor-pointer"
                onClick={() => fileInputRef.current.click()} // Trigger file input click
                aria-label="Upload File"
              />
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border-none rounded-full p-2 bg-gray-100 outline-none"
                placeholder="Votre message ... "
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={sendMessage}
                className="text-gray-400 rounded-full p-2"
                disabled={isLoading}
                aria-label="Send message"
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
