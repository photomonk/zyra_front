import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";

function getUserId() {
  let id = localStorage.getItem("zyra_uid");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("zyra_uid", id); }
  return id;
}

const socket = io("http://localhost:3000", {
  auth: { userId: getUserId() },
});

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #f4f7f9;
    color: #334155;
    height: 100dvh;
    overflow: hidden;
  }

  #root { height: 100dvh; display: flex; flex-direction: column; }

  /* Header */
  .hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid #e2e8f0;
    background: #ffffff; flex-shrink: 0;
  }
  .hd-name { font-weight: 600; font-size: 18px; color: #0ea5e9; }
  .hd-right { display: flex; align-items: center; gap: 12px; }

  .dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; transition: background .3s; }
  .dot.on   { background: #22c55e; box-shadow: 0 0 6px #22c55e88; }
  .dot.busy { background: #0ea5e9; animation: pulse .7s ease-in-out infinite; }
  .dot.err  { background: #f87171; }
  @keyframes pulse { 50% { opacity: .3; } }

  .btn-pill {
    background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b;
    padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: 0.2s; font-family: 'Inter', sans-serif;
  }
  .btn-pill:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

  /* Profile */
  .profile-section {
    display: flex; flex-direction: column; align-items: center;
    padding: 28px 0 20px;
    background: #ffffff; border-bottom: 1px solid #e2e8f0;
  }
  .zyra-img-container {
    width: 90px; height: 90px; border-radius: 50%;
    border: 3px solid #0ea5e9; overflow: hidden;
    background: #f1f5f9; display: flex;
    align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .zyra-img-container img { width: 100%; height: 100%; object-fit: cover; }
  .zyra-fallback {
    font-size: 32px; font-weight: 700; color: #0ea5e9;
    font-family: 'Inter', sans-serif;
  }

  /* Messages */
  .msgs { flex: 1; overflow-y: auto; padding: 16px 0; background: #f8fafc; scroll-behavior: smooth; }
  .msgs::-webkit-scrollbar { width: 4px; }
  .msgs::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

  .row { padding: 6px 24px; animation: up .2s ease; }
  @keyframes up { from { opacity:0; transform: translateY(5px); } to { opacity:1; transform:none; } }

  .bubble {
    display: flex; gap: 10px; padding: 12px 16px;
    border-radius: 12px; max-width: 80%;
  }
  .bubble.user      { background: #0ea5e9; color: white; margin-left: auto; border-bottom-right-radius: 4px; }
  .bubble.assistant { background: #ffffff; border: 1px solid #e2e8f0; color: #334155; border-bottom-left-radius: 4px; }

  .body { font-size: 14px; line-height: 1.65; }
  .bubble.user .body { color: white; }

  .body p { margin-bottom: .45em; }
  .body p:last-child { margin-bottom: 0; }
  .body code { font-size: 12px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 5px; border-radius: 4px; color: #0284c7; }
  .bubble.user .body code { background: #0284c7; border-color: #0284c7; color: white; }
  .body pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; overflow-x: auto; margin: 6px 0; }
  .body strong { font-weight: 600; }
  .body a { color: #0ea5e9; }

  .cursor {
    display: inline-block; width: 2px; height: 13px;
    background: #0ea5e9; margin-left: 2px; vertical-align: middle;
    animation: blink .8s step-end infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }

  /* Footer */
  .ft {
    padding: 14px 24px 18px;
    background: #ffffff; border-top: 1px solid #e2e8f0; flex-shrink: 0;
  }

  .cmd-menu { display: flex; flex-wrap: wrap; gap: 8px; max-width: 800px; margin: 0 auto 10px; }
  .cmd-pill {
    background: #f1f5f9; border: 1px solid #e2e8f0; color: #0ea5e9;
    padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: 0.2s; font-family: 'Inter', sans-serif;
  }
  .cmd-pill:hover { background: #0ea5e9; color: white; border-color: #0ea5e9; }

  .ft-row { display: flex; gap: 10px; max-width: 800px; margin: 0 auto; align-items: flex-end; }

  textarea {
    flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    color: #1e293b; padding: 10px 14px; outline: none; resize: none;
    font-family: 'Inter', sans-serif; font-size: 14px;
    min-height: 42px; max-height: 120px; line-height: 1.5;
    transition: border-color .2s;
  }
  textarea::placeholder { color: #94a3b8; }
  textarea:focus { border-color: #7dd3fc; }

  .btn-send {
    background: #0ea5e9; border: none; border-radius: 8px;
    width: 42px; height: 42px; color: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s; flex-shrink: 0;
  }
  .btn-send:hover:not(:disabled) { background: #0284c7; transform: translateY(-1px); }
  .btn-send:disabled { background: #bae6fd; cursor: not-allowed; transform: none; }
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function App() {
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState("");
  const [busy, setBusy]     = useState(false);
  const [dot, setDot]       = useState("off");
  const endRef              = useRef(null);
  const taRef               = useRef(null);

  useEffect(() => {
    socket.on("connect",    () => setDot("on"));
    socket.on("disconnect", () => setDot("err"));

    socket.on("start", () => {
      setBusy(true);
      setDot("busy");
      setMsgs(p => [...p, { role: "assistant", content: "" }]);
    });

    socket.on("token", ({ token }) =>
      setMsgs(p => {
        const u = [...p];
        u[u.length - 1] = { ...u[u.length - 1], content: u[u.length - 1].content + token };
        return u;
      })
    );
    


    socket.on("end", () => {
      setBusy(false);
      setDot("on");
      taRef.current?.focus();
    });

    socket.on("error", ({ message }) => {
      setBusy(false);
      setDot("err");
      setMsgs(p => {
        const u = [...p];
        u[u.length - 1] = { role: "assistant", content: `⚠ ${message}` };
        return u;
      });
    });

    socket.on("cleared", () => setMsgs([]));
    return () => socket.removeAllListeners();
  }, []);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const send = (text) => {
    const msg = typeof text === "string" ? text : input.trim();
    if (!msg || busy) return;
    setMsgs(p => [...p, { role: "user", content: msg }]);
    socket.emit("message", { text: msg });
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const onInput = e => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <>
      <header className="hd">
        <span className="hd-name">ZYRA</span>
        <div className="hd-right">
          <span className={`dot ${dot}`} />
          <button className="btn-pill" onClick={() => {
  setMsgs([]);          // Clear the screen right now
  socket.emit("clear"); // Tell the server to clear its memory too
}}>
  Clear Chat
</button>
          {/* <button className="btn-pill" onClick={() => socket.emit("clear")}>Clear Chat</button> */}
        </div>
      </header>

      <div className="msgs">
        {/* Profile section */}
        <div className="profile-section">
          <div className="zyra-img-container">
            <img src="/favicon.png" alt="ZYRA" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>Virtual Assistant</p>
        </div>

        {msgs.map((m, i) => (
          <div className="row" key={i}>
            <div className={`bubble ${m.role}`}>
              <div className="body">
                <ReactMarkdown>{m.content}</ReactMarkdown>
                {busy && i === msgs.length - 1 && m.role === "assistant" && (
                  <span className="cursor" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <footer className="ft">
        <div className="cmd-menu">
          <button className="cmd-pill" onClick={() => send("/stress")}>Stress Relief</button>
          <button className="cmd-pill" onClick={() => send("/anxiety")}>Anxiety Help</button>
          <button className="cmd-pill" onClick={() => send("/depression")}>Depression Support</button>

        </div>
        <div className="ft-row">
          <textarea
            ref={taRef}
            rows={1}
            placeholder="Type a message..."
            value={input}
            onChange={onInput}
            onKeyDown={onKey}
          />
          <button className="btn-send" onClick={send} disabled={!input.trim() || busy}>
            <SendIcon />
          </button>
        </div>
      </footer>
    </>
  );
}
