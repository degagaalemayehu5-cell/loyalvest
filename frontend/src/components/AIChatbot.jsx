import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiX, FiMinimize2 } from 'react-icons/fi';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! 👋 I\'m your investment assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Investment related responses
    if (msg.includes('invest') || msg.includes('investment') || msg.includes('plan')) {
      return "📈 **Investment Plans Available:**\n\n• **Bronze Plan:** 5% return (Min: ₹0)\n• **Silver Plan:** 8% return (Min: ₹1,000)\n• **Gold Plan:** 12% return (Min: ₹5,000)\n• **Platinum Plan:** 15% return (Min: ₹20,000)\n• **Diamond Plan:** 20% return (Min: ₹50,000)\n\nWant to know more about any specific plan?";
    }
    
    if (msg.includes('withdraw') || msg.includes('withdrawal')) {
      return "💸 **Withdrawal Information:**\n\n• Minimum withdrawal: ₹100\n• Maximum withdrawal: ₹100,000\n• Processing time: 24-48 hours\n• No processing fees\n\nTo withdraw, go to Wallet → Withdraw and fill in your bank details.";
    }
    
    if (msg.includes('recharge') || msg.includes('deposit') || msg.includes('add money')) {
      return "💰 **How to Recharge:**\n\n1. Go to Wallet section\n2. Click on 'Recharge'\n3. Contact any admin for payment details\n4. Send payment screenshot\n5. Amount will be credited within 24 hours\n\nNeed admin contact info? Just ask!";
    }
    
    if (msg.includes('profit') || msg.includes('earning') || msg.includes('return')) {
      return "📊 **How Profit Works:**\n\nYour profit is calculated daily based on your active investments. The profit rate depends on your investment level. Higher investments = higher returns!\n\nCheck your 'Profit' tab to see real-time earnings.";
    }
    
    if (msg.includes('referral') || msg.includes('refer') || msg.includes('bonus')) {
      return "🎁 **Referral Program:**\n\n• Invite friends using your unique referral code\n• Get ₹50 bonus for each successful referral\n• No limit on referrals\n• Share your code in 'Account' section\n\nStart referring and earn more!";
    }
    
    if (msg.includes('level') || msg.includes('tier') || msg.includes('upgrade')) {
      return "🏆 **Level System:**\n\n• Bronze: ₹0 - ₹999 (5% profit)\n• Silver: ₹1,000 - ₹4,999 (8% profit)\n• Gold: ₹5,000 - ₹19,999 (12% profit)\n• Platinum: ₹20,000 - ₹49,999 (15% profit)\n• Diamond: ₹50,000+ (20% profit)\n\nIncrease your total investment to level up!";
    }
    
    if (msg.includes('admin') || msg.includes('contact support') || msg.includes('help')) {
      return "👨‍💼 **Contact Admin:**\n\nYou can reach our admins at:\n• Email: support@loyalvest.com\n• Through the Settings page\n\nAdmins are available 24/7 to assist you!";
    }
    
    if (msg.includes('balance') || msg.includes('wallet')) {
      return "💳 **Wallet Info:**\n\nYour wallet shows your available balance. You can:\n• Recharge to add funds\n• Withdraw to bank account\n• Invest in products\n• Track all transactions\n\nCheck your 'Account' page for detailed stats.";
    }
    
    if (msg.includes('how to') || msg.includes('guide') || msg.includes('tutorial')) {
      return "📚 **Quick Guide:**\n\n1. **Recharge** - Add money to wallet\n2. **Invest** - Choose investment plan\n3. **Earn** - Daily profit credited\n4. **Withdraw** - Transfer to bank\n\nNeed specific help? Just ask!";
    }
    
    if (msg.includes('thank')) {
      return "You're welcome! 😊 I'm here to help anytime. Keep investing and growing your wealth! 🚀";
    }
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      return "Hello! 👋 Welcome to Loyalvest! How can I assist you with your investments today?";
    }
    
    // Default response
    return "I'm here to help with:\n• Investment plans 📈\n• Withdrawals 💸\n• Recharges 💰\n• Referrals 🎁\n• Levels & Profits 🏆\n\nWhat would you like to know more about?";
  };
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMessage = { type: 'bot', text: botResponse, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
      >
        <FiMessageSquare className="w-6 h-6" />
      </button>
    );
  }
  
  return (
    <div className={`fixed right-4 bottom-20 bg-white rounded-xl shadow-2xl flex flex-col z-40 transition-all duration-300 ${
      isMinimized ? 'w-72 h-14' : 'w-80 h-96 sm:w-96'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
          <span className="text-xs bg-green-400 px-2 py-0.5 rounded-full">Online</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            <FiMinimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Investment Plans', 'How to Withdraw', 'Referral Bonus', 'My Level'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap hover:bg-gray-300 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 input-field resize-none py-2 text-sm"
                rows="1"
                style={{ minHeight: '40px', maxHeight: '80px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatbot;