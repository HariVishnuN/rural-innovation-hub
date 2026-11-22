import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, User, MessageSquare, Check, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import apiClient from '../../api/client';
import { ChatWebSocketClient } from '../../api/websocket';
import { Button } from '../../components/Button';

const ChatPage = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(() => {
    const p = searchParams.get('partner');
    return p ? parseInt(p) : null;
  });
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected'); // 'connected' | 'disconnected'

  const wsClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load conversations list
  useEffect(() => {
    apiClient.get('/conversations').then((res) => {
      setConversations(res.data);
      if (!activePartnerId && res.data.length > 0) {
        setActivePartnerId(res.data[0].partner_id);
      }
    });
  }, []);

  // When active partner changes, fetch history and connect WebSocket
  useEffect(() => {
    if (!activePartnerId) return;

    // Fetch partner details
    apiClient.get(`/users/${activePartnerId}`).then((res) => setPartnerProfile(res.data));

    // Fetch history
    apiClient.get(`/conversations/${activePartnerId}/messages`).then((res) => {
      setMessages(res.data);
      scrollToBottom();
    });

    // Establish WebSocket connection
    if (token) {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }

      wsClientRef.current = new ChatWebSocketClient(
        activePartnerId,
        token,
        (incomingMsg) => {
          setMessages((prev) => [...prev, incomingMsg]);
          scrollToBottom();
        },
        (status) => setWsStatus(status)
      );
      wsClientRef.current.connect();
    }

    return () => {
      if (wsClientRef.current) wsClientRef.current.disconnect();
    };
  }, [activePartnerId, token]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');

    if (wsClientRef.current && wsClientRef.current.sendMessage(text)) {
      // Sent via WebSocket
    } else {
      // Fallback to HTTP REST
      apiClient.post('/conversations/messages', {
        receiver_id: activePartnerId,
        message_text: text,
      }).then((res) => {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom();
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden h-[75vh] flex">
        {/* Left Sidebar: Conversations List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Direct Messages</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active message threads. Message a maker from their blueprint page!
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.partner_id}
                  onClick={() => setActivePartnerId(c.partner_id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    activePartnerId === c.partner_id ? 'bg-teal-50 border-l-4 border-teal-600' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.partner_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">{c.last_message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Main Chat Pane */}
        <div className="w-2/3 flex flex-col bg-white">
          {activePartnerId && partnerProfile ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {partnerProfile.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{partnerProfile.full_name}</h3>
                    <span className="text-[10px] text-slate-500">{partnerProfile.role} • {partnerProfile.state || 'India'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {wsStatus === 'connected' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Real-time Active</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Connecting...</span>
                    </>
                  )}
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30">
                {messages.map((m, idx) => {
                  const isMine = m.sender_id === user?.id;
                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-teal-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-soft'
                        }`}
                      >
                        <div>{m.message_text}</div>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isMine ? 'text-teal-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type an engineering query or message..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
