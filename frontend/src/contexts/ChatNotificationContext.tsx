import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Badge, Button, Toast, ToastContainer } from "react-bootstrap";
import { ChatDots } from "react-bootstrap-icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation, useNavigate } from "react-router";
import {
  ChatConversationResponse,
  ChatMessageResponse,
  getConversations,
  markConversationAsRead,
} from "../clients/ChatClient";
import { WS_CHAT_URL } from "../config/ApiConfig";
import { useProfile } from "./ProfileContext";

interface IChatNotificationContext {
  totalUnreadCount: number;
  unreadByConversation: Record<number, number>;
  setActiveViewingConversationId: (conversationId: number | null) => void;
  markConversationRead: (conversationId: number) => Promise<void>;
  refreshUnread: () => Promise<void>;
}

const ChatNotificationContext = createContext<
  IChatNotificationContext | undefined
>(undefined);

export function ChatNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = profileData?.id ? parseInt(profileData.id, 10) : 0;

  const [unreadByConversation, setUnreadByConversation] = useState<
    Record<number, number>
  >({});
  const [latestNotification, setLatestNotification] =
    useState<ChatMessageResponse | null>(null);

  const activeViewingConversationIdRef = useRef<number | null>(null);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  const setActiveViewingConversationId = useCallback(
    (conversationId: number | null) => {
      activeViewingConversationIdRef.current = conversationId;
    },
    [],
  );

  const syncFromConversations = useCallback(
    (list: ChatConversationResponse[]) => {
      const next: Record<number, number> = {};
      for (const conv of list) {
        next[conv.id] = conv.unreadCount ?? 0;
      }
      setUnreadByConversation(next);
    },
    [],
  );

  const refreshUnread = useCallback(async () => {
    if (!currentUserId) {
      setUnreadByConversation({});
      return;
    }
    try {
      const list = await getConversations();
      syncFromConversations(list);
    } catch (err) {
      console.error("Failed to refresh unread chat count:", err);
    }
  }, [currentUserId, syncFromConversations]);

  const markConversationRead = useCallback(
    async (conversationId: number) => {
      if (!currentUserId) return;
      setUnreadByConversation((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
      try {
        const updated = await markConversationAsRead(conversationId);
        setUnreadByConversation((prev) => ({
          ...prev,
          [updated.id]: updated.unreadCount ?? 0,
        }));
      } catch (err) {
        console.error("Failed to mark conversation as read:", err);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!currentUserId) {
      setUnreadByConversation({});
      setLatestNotification(null);
      return;
    }

    void refreshUnread();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_CHAT_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(
          `/topic/users/${currentUserId}/conversations`,
          (message) => {
            const conv = JSON.parse(message.body) as ChatConversationResponse;
            setUnreadByConversation((prev) => ({
              ...prev,
              [conv.id]: conv.unreadCount ?? 0,
            }));
          },
        );

        client.subscribe(`/topic/users/${currentUserId}/messages`, (message) => {
          const incoming = JSON.parse(message.body) as ChatMessageResponse;
          if (incoming.senderId === currentUserId) return;

          const isViewingSameConversation =
            pathnameRef.current === "/chat" &&
            activeViewingConversationIdRef.current === incoming.conversationId;

          if (!isViewingSameConversation) {
            setLatestNotification(incoming);
          }
        });

        void refreshUnread();
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [currentUserId, refreshUnread]);

  const totalUnreadCount = useMemo(
    () =>
      Object.values(unreadByConversation).reduce(
        (sum, count) => sum + (count > 0 ? count : 0),
        0,
      ),
    [unreadByConversation],
  );

  const handleOpenNotification = () => {
    if (!latestNotification) return;
    const convId = latestNotification.conversationId;
    setLatestNotification(null);
    navigate(`/chat?conversationId=${convId}`);
  };

  const value = useMemo<IChatNotificationContext>(
    () => ({
      totalUnreadCount,
      unreadByConversation,
      setActiveViewingConversationId,
      markConversationRead,
      refreshUnread,
    }),
    [
      totalUnreadCount,
      unreadByConversation,
      setActiveViewingConversationId,
      markConversationRead,
      refreshUnread,
    ],
  );

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}

      <ToastContainer
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1090 }}
      >
        <Toast
          show={Boolean(latestNotification)}
          onClose={() => setLatestNotification(null)}
          delay={6000}
          autohide
          bg="light"
          className="border shadow"
        >
          <Toast.Header className="d-flex align-items-center gap-2">
            <ChatDots size={15} className="text-success" />
            <strong className="me-auto text-dark">
              Tin nhắn mới từ {latestNotification?.senderName}
            </strong>
            <Badge bg="danger" pill>
              Mới
            </Badge>
          </Toast.Header>
          <Toast.Body>
            <div
              className="text-dark small mb-2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {latestNotification?.content || "Bạn có một tin nhắn chưa đọc."}
            </div>
            <div className="d-flex justify-content-end">
              <Button
                size="sm"
                variant="success"
                onClick={handleOpenNotification}
                style={{ backgroundColor: "#376412", borderColor: "#376412" }}
              >
                Xem tin nhắn
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotification(): IChatNotificationContext {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error(
      "useChatNotification must be used within a ChatNotificationProvider",
    );
  }
  return context;
}

