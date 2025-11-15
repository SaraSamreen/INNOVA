import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, RefreshCw } from 'lucide-react';

function Message({ from, children }) {
  const isUser = from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}> 
      <div className={`px-4 py-2 rounded-xl max-w-[70%] ${isUser ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
        {children}
      </div>
    </div>
  );
}

export default function DesignerChat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'assistant', text: 'Hi — I\'m your co-designer. Tell me what change you want (e.g., "make handle shorter", "change to glass material").' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // Mock assistant reply (simulate short latency)
    setLoading(true);
    setTimeout(() => {
      const reply = { id: Date.now()+1, from: 'assistant', text: `Okay — I can ${userMsg.text}. Would you like to apply this change to all variants or only the selected one?` };
      setMessages((m) => [...m, reply]);
      setLoading(false);
    }, 700);
  };

  const quickCommands = ['Make handle shorter', 'Change to glass material', 'Switch primary color to charcoal', 'Increase padding by 5mm'];

  return (
    <div className="flex h-full flex-col bg-white border rounded-2xl">
      <div className="p-4 border-b"> 
        <h3 className="text-sm font-semibold">AI Co-Designer</h3>
        <p className="text-xs text-slate-500">Ask for quick edits, material changes or design rationale.</p>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {messages.map((m) => (
          <Message key={m.id} from={m.from}>{m.text}</Message>
        ))}
        {loading && <div className="text-sm text-slate-500">Assistant is typing...</div>}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2 mb-3">
          {quickCommands.map((q) => (
            <button key={q} onClick={() => setInput(q)} className="text-xs px-3 py-1 rounded-full border bg-slate-50">{q}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask the co-designer..." className="flex-1 rounded-xl border p-3" />
          <button onClick={send} className="px-3 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2"><Send className="w-4 h-4" />Send</button>
        </div>
      </div>
    </div>
  );
}
