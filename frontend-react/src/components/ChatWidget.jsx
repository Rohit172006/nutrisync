import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your NutriSync Assistant. How can I help you today?", loading: false }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleVoice = () => setIsVoiceEnabled(prev => !prev);

  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    let cleanText = text.replace(/<[^>]*>?/gm, '');
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = inputVal.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputVal('');
    setMessages(prev => [...prev, { role: 'bot', text: '', loading: true }]);

    try {
      const data = await sendChatMessage(msg);
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: 'bot', text: data.reply || "I couldn't process that.", loading: false };
        return newArr;
      });
      speakText(data.reply || "I couldn't process that.");
    } catch (err) {
      // Offline fallback
      let fallbackReply = "I'm having trouble connecting to the server. Could you try again later?";
      const msgLower = msg.toLowerCase();
      if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
          fallbackReply = "Hello there! I'm operating in offline mode right now, but I can still help explain the website features or basic health questions!";
      } else if (msgLower.includes("dashboard")) {
          fallbackReply = "The dashboard combines your heart rate, sleep, SpO2, and activity. It predicts your overall stress levels and dynamically generates a personalized 3-meal dietary plan tailored to your metrics.";
      }
      setTimeout(() => {
        setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { 
                role: 'bot', 
                text: `<div style="font-size:0.75rem; color:#e67e22; margin-bottom:5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9;">Offline Mode Active</div>${fallbackReply}`, 
                loading: false,
                offline: true
            };
            return newArr;
        });
        speakText(fallbackReply);
      }, 600);
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-fab" onClick={() => setIsOpen(true)} title="Open AI Coach">
        <i className="fa-solid fa-message"></i>
      </button>
    );
  }

  return (
    <div className="chat-widget" style={{ display: 'flex' }}>
      <div className="chat-header">
        <span>
          <div className="bot-avatar-header"><i className="fa-solid fa-leaf"></i></div>
          NutriSync Coach
        </span>
        <div style={{ display: 'flex', gap: '10px', zIndex: 1 }}>
          <button onClick={toggleVoice} title={`Toggle Voice (Currently ${isVoiceEnabled ? 'ON' : 'OFF'})`}>
            <i className={isVoiceEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark"}></i>
          </button>
          <button onClick={() => setIsOpen(false)} title="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message-wrapper ${m.role === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}>
            {m.role === 'bot' && (
              <div className="bot-avatar" style={{ background: m.offline ? '#f39c12' : '' }}>
                <i className={`fa-solid ${m.loading ? 'fa-robot fa-fade' : m.offline ? 'fa-wifi' : 'fa-robot'}`}></i>
              </div>
            )}
            <div 
                className={`msg ${m.role === 'user' ? 'user' : 'ai'}`} 
                dangerouslySetInnerHTML={{ __html: m.loading ? '<i class="fa-solid fa-ellipsis fa-beat"></i>' : m.text }}
            />
          </div>
        ))}
      </div>

      <form className="chat-footer" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Ask about your diet..." 
          required 
          autoComplete="off" 
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
        />
        <button type="submit" title="Send"><i className="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  );
}

export default ChatWidget;
