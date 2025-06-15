import { useEffect, useState, useRef } from "react";

const MessageDropdown = () => {
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState([]);
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef();

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [msgRes, countRes] = await Promise.all([
      fetch("/api/messages", { headers }),
      fetch("/api/messages/unread-count", { headers }),
    ]);

    const msgData = await msgRes.json();
    const countData = await countRes.json();

    setMessages(msgData.messages);
    setUnread(countData.unread);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async () => {
    setVisible(!visible);

    if (unread > 0) {
      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUnread(0); // Reset badge
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
      title="Messages"
        onClick={handleClick}
        className="relative bg-yellow-400 text-black px-3 py-2 rounded shadow"
      >
        💬 
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {visible && (
        <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 border-b font-semibold">Recent Messages</div>
          <ul className="p-2 space-y-2">
            {messages.length === 0 && <li className="text-gray-500">No messages</li>}
            {messages.map((msg, idx) => (
              <li key={idx} className="text-sm border-b pb-1">
                <div>{msg.content}</div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;
