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
  getUnreadMessageCount,
  getUnreadMessages,
  markAllConversationsAsRead,
  markConversationAsRead,
  markMessageRead,
} from "../clients/ChatClient";
import { WS_CHAT_URL } from "../config/ApiConfig";
import { useProfile } from "./ProfileContext";

interface IChatNotificationContext {
  totalUnreadCount: number;
  unreadByConversation: Record<number, number>;
  unreadNotifications: ChatMessageResponse[];
  setActiveViewingConversationId: (conversationId: number | null) => void;
  markConversationRead: (conversationId: number) => Promise<void>;
  markNotificationRead: (messageId: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
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
  const [unreadNotifications, setUnreadNotifications] = useState<
    ChatMessageResponse[]
  >([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<ChatMessageResponse | null>(null);

  const activeViewingConversationIdRef = useRef<number | null>(null);
  const pathnameRef = useRef(location.pathname);
  const shownInitialLoginToastForUserRef = useRef<number | null>(null);

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
      setUnreadNotifications([]);
      setTotalUnreadCount(0);
      return;
    }
    try {
      const [page, unreadTotal, unreadMsgs] = await Promise.all([
        getConversations(0),
        getUnreadMessageCount(),
        getUnreadMessages(),
      ]);
      syncFromConversations(page.data ?? []);
      setTotalUnreadCount(unreadTotal);
      setUnreadNotifications(unreadMsgs);

      if (
        unreadMsgs.length > 0 &&
        shownInitialLoginToastForUserRef.current !== currentUserId
      ) {
        shownInitialLoginToastForUserRef.current = currentUserId;
        const firstUnread = unreadMsgs[0];
        const isViewingSame =
          pathnameRef.current === "/chat" &&
          activeViewingConversationIdRef.current === firstUnread.conversationId;
        if (!isViewingSame) {
          setLatestNotification(firstUnread);
        }
      }
    } catch (err) {
      console.error("Failed to refresh unread chat count:", err);
    }
  }, [currentUserId, syncFromConversations]);

  const markConversationRead = useCallback(
    async (conversationId: number) => {
      if (!currentUserId) return;
      setUnreadByConversation((prev) => {
        const previousCount = prev[conversationId] ?? 0;
        if (previousCount > 0) {
          setTotalUnreadCount((total) => Math.max(0, total - previousCount));
        }
        return {
          ...prev,
          [conversationId]: 0,
        };
      });
      setUnreadNotifications((prev) =>
        prev.filter((msg) => msg.conversationId !== conversationId),
      );
      setLatestNotification((prev) =>
        prev?.conversationId === conversationId ? null : prev,
      );
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

  const markNotificationRead = useCallback(
    async (messageId: number) => {
      if (!currentUserId) return;
      try {
        const updated = await markMessageRead(messageId);
        setUnreadNotifications((prev) => {
          const existed = prev.some((m) => m.id === messageId);
          if (existed) {
            setTotalUnreadCount((total) => Math.max(0, total - 1));
            setUnreadByConversation((convMap) => ({
              ...convMap,
              [updated.conversationId]: Math.max(
                0,
                (convMap[updated.conversationId] ?? 1) - 1,
              ),
            }));
          }
          return prev.filter((m) => m.id !== messageId);
        });
        setLatestNotification((prev) => (prev?.id === messageId ? null : prev));
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    },
    [currentUserId],
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUserId) return;
    try {
      await markAllConversationsAsRead();
      setUnreadNotifications([]);
      setUnreadByConversation({});
      setTotalUnreadCount(0);
      setLatestNotification(null);
    } catch (err) {
      console.error("Failed to mark all messages as read:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      shownInitialLoginToastForUserRef.current = null;
      setUnreadByConversation({});
      setUnreadNotifications([]);
      setTotalUnreadCount(0);
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
            const nextUnread = conv.unreadCount ?? 0;
            setUnreadByConversation((prev) => {
              const previousUnread = prev[conv.id];
              if (previousUnread !== undefined) {
                const delta = nextUnread - previousUnread;
                if (delta !== 0) {
                  setTotalUnreadCount((total) => Math.max(0, total + delta));
                }
              } else {
                void getUnreadMessageCount()
                  .then((count) => setTotalUnreadCount(count))
                  .catch(() => undefined);
              }
              return {
                ...prev,
                [conv.id]: nextUnread,
              };
            });
          },
        );

        client.subscribe(`/topic/users/${currentUserId}/messages`, (message) => {
          const incoming = JSON.parse(message.body) as ChatMessageResponse;
          if (incoming.senderId === currentUserId) return;

          const isViewingSameConversation =
            pathnameRef.current === "/chat" &&
            activeViewingConversationIdRef.current === incoming.conversationId;

          if (!isViewingSameConversation) {
            setUnreadNotifications((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [incoming, ...prev].slice(0, 20);
            });
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

  const handleOpenNotification = () => {
    if (!latestNotification) return;
    const convId = latestNotification.conversationId;
    setLatestNotification(null);
    void markConversationRead(convId);
    navigate(`/chat?conversationId=${convId}`);
  };

  const value = useMemo<IChatNotificationContext>(
    () => ({
      totalUnreadCount,
      unreadByConversation,
      unreadNotifications,
      setActiveViewingConversationId,
      markConversationRead,
      markNotificationRead,
      markAllNotificationsRead,
      refreshUnread,
    }),
    [
      totalUnreadCount,
      unreadByConversation,
      unreadNotifications,
      setActiveViewingConversationId,
      markConversationRead,
      markNotificationRead,
      markAllNotificationsRead,
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
            <div className="d-flex justify-content-end gap-2">
              {latestNotification && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => void markNotificationRead(latestNotification.id)}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
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
