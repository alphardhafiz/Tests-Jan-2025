import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import dayjs from 'dayjs';

export default function Home() {
  const [inputLeft, setInputLeft] = useState('');
  const [inputRight, setInputRight] = useState('');
  const [messages, setMessages] = useState([]);
  const [flashLeft, setFlashLeft] = useState(false);
  const [flashRight, setFlashRight] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    wsRef.current = new WebSocket('ws://localhost:8080');

    wsRef.current.onopen = () => console.log('WebSocket Connected');

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }

      setMessages(prev => {
        const newMessages = [...prev, message];
        localStorage.setItem('messages', JSON.stringify(newMessages));
        return newMessages;
      });

      if (message.sender === 'left') {
        setFlashRight(true);
        setTimeout(() => setFlashRight(false), 1000);
      } else {
        setFlashLeft(true);
        setTimeout(() => setFlashLeft(false), 1000);
      }
    };

    return () => wsRef.current?.close();
  }, []);

  const sendMessage = (text, sender) => {
    if (!text.trim() || !wsRef.current) return;

    const message = { 
      text, 
      sender, 
      timestamp: new Date().toISOString() 
    };
    
    
    wsRef.current.send(JSON.stringify(message));

    
    sender === 'left' ? setInputLeft('') : setInputRight('');
  };
  
  return (
    <div>
      <Head>
        <title>Two-Way Chat</title>
      </Head>

      <main className="min-h-screen p-8 bg-gray-100">
        <div className="flex gap-4 max-w-6xl mx-auto">
          <ChatWindow
            title="Left Window"
            messages={messages.filter(msg => msg.sender === 'left' || msg.sender === 'right')}
            inputValue={inputLeft}
            setInputValue={setInputLeft}
            sendMessage={() => sendMessage(inputLeft, 'left')}
            flash={flashLeft}
          />

          <ChatWindow
            title="Right Window"
            messages={messages.filter(msg => msg.sender === 'right' || msg.sender === 'left')}
            inputValue={inputRight}
            setInputValue={setInputRight}
            sendMessage={() => sendMessage(inputRight, 'right')}
            flash={flashRight}
          />
        </div>
      </main>
    </div>
  );
}

const ChatWindow = ({ title, messages, inputValue, setInputValue, sendMessage, flash }) => (
  <div 
    className={`flex-1 bg-white rounded-lg shadow-lg p-4 transition-all duration-300 ${
      flash ? 'bg-yellow-100' : ''
    }`}
  >
    <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-auto mb-4 p-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-4 p-3 rounded-lg w-max max-w-[80%] ${
              msg.sender === title.toLowerCase().split(' ')[0] 
                ? 'bg-blue-100 ml-auto rounded-tr-none'
                : 'bg-gray-100 mr-auto rounded-tl-none'
            }`}
          >
            <p>{msg.text}</p>
            <span className="text-xs text-gray-500 block mt-1">
              {dayjs(msg.timestamp).format('HH:mm:ss')}
            </span>
          </div>
        ))}
      </div>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }} 
        className="mt-auto"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
);