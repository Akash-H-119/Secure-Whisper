import { apiFetch } from "../api";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  Smile,
  Menu,
  Settings,
  Info,
  Shield,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { WS_URL } from "@/lib/api"; // keep WS_URL import

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastMessage?: string;
  unread?: number;
  timestamp?: string;
}

interface Message {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
  encrypted: boolean;
}

const sampleContacts: Contact[] = [
  { id: "1", name: "Alice Cooper", status: "online" },
  { id: "2", name: "Bob Smith", status: "online" },
  { id: "3", name: "Carol White", status: "away" },
];

const ChatPage = () => {
  const [friends, setFriends] = useState<Contact[]>(sampleContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(sampleContacts[0] ?? null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [token] = useState<string>(localStorage.getItem("token") || "");
  const [currentUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token || !currentUser) {
      navigate("/");
    }
  }, [token, currentUser, navigate]);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);
  const [addingUsername, setAddingUsername] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{ id: string; username: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  function makeChatId(a: string | number, b: string | number) {
    const aStr = String(a);
    const bStr = String(b);
    const [min, max] = aStr < bStr ? [aStr, bStr] : [bStr, aStr];
    return `chat_${min}_${max}`;
  }

  // ✅ Use apiFetch instead of fetch
  async function fetchFriends() {
    if (!token) return;
    try {
      const data = await apiFetch("/api/friends", { method: "GET" });
      const mapped = data.friends.map((f: any) => ({ id: String(f.id), name: f.username }));
      setFriends(mapped.length ? mapped : sampleContacts);
      if (mapped.length) setSelectedContact(mapped[0]);
    } catch {
      console.warn("Failed to load friends");
    }
  }

  async function fetchMessagesFor(chatId: string) {
    if (!token) return;
    try {
      const data = await apiFetch(`/api/messages?chatId=${encodeURIComponent(chatId)}`, { method: "GET" });
      const mapped = data.messages.map((m: any) => ({
        id: String(m.id),
        sender: String(m.sender_id) === String(currentUser?.id ?? -1) ? "me" : "them",
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        encrypted: true,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }

  useEffect(() => {
    if (!token) return;
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      if (currentChatIdRef.current && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe", chatId: currentChatIdRef.current }));
      }
    };

    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload.type === "message" && payload.message) {
          const msg = payload.message;
          if (msg.chat_id === currentChatIdRef.current) {
            setMessages((m) => {
              if (m.some((existing) => existing.id === String(msg.id))) return m;
              return [
                ...m,
                {
                  id: String(msg.id),
                  sender: String(msg.sender_id) === String(currentUser?.id ?? -1) ? "me" : "them",
                  content: msg.content,
                  timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  encrypted: true,
                },
              ];
            });
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onclose = () => (wsRef.current = null);
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [token]);

  useEffect(() => {
    fetchFriends();
  }, [token, currentUser]);

  useEffect(() => {
    if (!selectedContact || !currentUser) return;

    const chatId = makeChatId(currentUser.id, selectedContact.id);
    const previousChatId = currentChatIdRef.current;

    setMessages([]);
    setCurrentChatId(chatId);
    fetchMessagesFor(chatId);

    const subscribeToChat = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (previousChatId && previousChatId !== chatId) {
          wsRef.current.send(JSON.stringify({ type: "unsubscribe", chatId: previousChatId }));
        }
        wsRef.current.send(JSON.stringify({ type: "subscribe", chatId }));
      } else {
        setTimeout(subscribeToChat, 100);
      }
    };
    subscribeToChat();
  }, [selectedContact, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Use apiFetch for sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChatId) return;

    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ chatId: currentChatId, content: message }),
      });
      setMessage("");
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  // ✅ Use apiFetch for searching users
  async function handleSearchUser() {
    if (!addingUsername.trim()) return;
    setIsSearching(true);
    try {
      const searchData = await apiFetch(`/api/users/search?q=${encodeURIComponent(addingUsername.trim())}`, {
        method: "GET",
      });
      if (!searchData.user) {
        toast({ title: "User not found", description: "Please check the username", variant: "destructive" });
        setSearchResult(null);
        return;
      }
      setSearchResult(searchData.user);
      toast({ title: "User found", description: "Click 'Add Friend' to send friend request" });
    } catch {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }

  // ✅ Use apiFetch for adding friends
  async function handleAddFriend() {
    if (!searchResult) return;
    try {
      const data = await apiFetch("/api/friends/add", {
        method: "POST",
        body: JSON.stringify({ identifier: searchResult.username }),
      });
      const newFriend: Contact = { id: String(data.friend.id), name: data.friend.username, status: "offline" };
      setFriends((f) => [newFriend, ...f]);
      setAddingUsername("");
      setSearchResult(null);
      toast({ title: "Friend added", description: `${newFriend.name} added` });
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  }

  // ✅ Use apiFetch for clearing chat
  async function handleClearChat() {
    if (!currentChatId) return;
    try {
      await apiFetch("/api/messages/clear", {
        method: "DELETE",
        body: JSON.stringify({ chatId: currentChatId }),
      });
      setMessages([]);
      setShowClearDialog(false);
      toast({ title: "Chat cleared", description: "All messages have been removed" });
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  }

  // --- (UI BELOW UNCHANGED) ---
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ... existing JSX (unchanged) ... */}
    </div>
  );
};

export default ChatPage;
