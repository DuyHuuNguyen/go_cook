import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  initialChefOrders,
  initialMenus,
  initialSlots,
  isBooked,
  endTime,
  overlaps,
  type DemoOrder,
  type DemoMenu,
  type DemoSlot,
  type DemoFile,
  type DemoStatus,
} from "../pages/seller/sellerMockData";

interface SellerDemoState {
  orders: DemoOrder[];
  menus: DemoMenu[];
  slots: DemoSlot[];
  transition: (id: string, status: DemoStatus, reason?: string) => void;
  saveMenu: (menu: DemoMenu) => void;
  hideMenu: (id: string) => void;
  addSlot: (slot: DemoSlot) => void;
  removeSlot: (id: string) => void;
  toggleSlot: (id: string) => void;
  addReceipts: (id: string, files: DemoFile[]) => void;
  removeReceipt: (id: string, fileId: string) => void;
  readFiles: (files: File[], receipts?: boolean) => DemoFile[];
}
const SellerDemoContext = createContext<SellerDemoState | null>(null);
export function SellerDemoProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState(initialChefOrders);
  const [menus, setMenus] = useState(() =>
    initialMenus.map((menu) => ({
      ...menu,
      images: menu.images.map((image) => ({
        ...image,
        url: `${import.meta.env.BASE_URL}${image.url.replace(/^\//, "")}`,
      })),
    })),
  );
  const [slots, setSlots] = useState(initialSlots);
  const urls = useRef<string[]>([]);
  useEffect(
    () => () => urls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  function transition(id: string, status: DemoStatus, reason = "") {
    const order = orders.find((item) => item.id === id);
    if (!order) throw new Error("Không tìm thấy đơn.");
    const next: Partial<Record<DemoStatus, DemoStatus[]>> = {
      PENDING: ["CONFIRMED", "REJECTED"],
      CONFIRMED: ["PREPARING"],
      PREPARING: ["COOKING"],
      COOKING: ["AWAITING_ACCEPTANCE"],
    };
    if (!next[order.status]?.includes(status))
      throw new Error("Không thể chuyển sang trạng thái này.");
    if (status === "REJECTED" && !reason.trim())
      throw new Error("Vui lòng nhập lý do từ chối.");
    if (status === "CONFIRMED") {
      if (
        !slots.some(
          (slot) =>
            slot.date === order.date &&
            slot.available &&
            slot.start <= order.time &&
            slot.end >= endTime(order),
        )
      )
        throw new Error(
          "Đơn không nằm trong lịch mở. Vui lòng mở khung giờ trước khi nhận đơn.",
        );
      if (
        orders.some(
          (other) =>
            other.id !== id &&
            other.date === order.date &&
            isBooked(other.status) &&
            overlaps(order.time, endTime(order), other.time, endTime(other)),
        )
      )
        throw new Error("Lịch nấu trùng với một đơn đã nhận.");
    }
    setOrders((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              history: [
                ...item.history,
                { status, at: new Date().toISOString(), note: reason.trim() },
              ],
            }
          : item,
      ),
    );
  }
  function saveMenu(menu: DemoMenu) {
    if (
      !menu.name.trim() ||
      menu.price <= 0 ||
      menu.minGuests < 1 ||
      menu.maxGuests < menu.minGuests ||
      !menu.dishes.trim()
    )
      throw new Error("Kiểm tra tên, giá, số khách và danh sách món.");
    if (menu.status === "PUBLISHED" && !menu.images.length)
      throw new Error("Thực đơn hiển thị phải có ít nhất một ảnh.");
    setMenus((current) =>
      current.some((item) => item.id === menu.id)
        ? current.map((item) => (item.id === menu.id ? menu : item))
        : [menu, ...current],
    );
  }
  function addSlot(slot: DemoSlot) {
    if (!slot.date || slot.start >= slot.end)
      throw new Error("Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.");
    if (
      slots.some(
        (item) =>
          item.date === slot.date &&
          overlaps(slot.start, slot.end, item.start, item.end),
      )
    )
      throw new Error(
        "Khung giờ bị trùng. Hãy xóa khung cũ trước khi thiết lập lại.",
      );
    if (
      !slot.available &&
      orders.some(
        (order) =>
          isBooked(order.status) &&
          order.date === slot.date &&
          overlaps(slot.start, slot.end, order.time, endTime(order)),
      )
    )
      throw new Error("Không thể đóng khung giờ đang có đơn đã nhận.");
    setSlots((current) => [...current, slot]);
  }
  function removeSlot(id: string) {
    const slot = slots.find((item) => item.id === id);
    if (
      slot &&
      orders.some(
        (order) =>
          isBooked(order.status) &&
          order.date === slot.date &&
          overlaps(slot.start, slot.end, order.time, endTime(order)),
      )
    )
      throw new Error("Khung giờ đang có đơn đã nhận, không thể xóa.");
    setSlots((current) => current.filter((item) => item.id !== id));
  }
  function toggleSlot(id: string) {
    const slot = slots.find((item) => item.id === id);
    if (!slot) return;
    if (
      slot.available &&
      orders.some(
        (order) =>
          isBooked(order.status) &&
          order.date === slot.date &&
          overlaps(slot.start, slot.end, order.time, endTime(order)),
      )
    )
      throw new Error("Không thể đóng khung giờ đang có đơn đã nhận.");
    setSlots((current) =>
      current.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  }
  function checkReceiptOrder(id: string) {
    const order = orders.find((item) => item.id === id);
    if (!order || !["PREPARING", "COOKING"].includes(order.status))
      throw new Error("Chỉ cập nhật hóa đơn khi đang chuẩn bị hoặc đang nấu.");
    return order;
  }
  function readFiles(files: File[], receipts = false) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      ...(receipts ? ["application/pdf"] : []),
    ];
    const limit = (receipts ? 10 : 5) * 1024 * 1024;
    if (
      files.some(
        (file) =>
          !allowed.includes(file.type) || file.size > limit || !file.size,
      )
    )
      throw new Error(
        `Chọn JPG, PNG, WebP${receipts ? " hoặc PDF" : ""}, tối đa ${receipts ? 10 : 5} MB/file và không rỗng.`,
      );
    return files.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { id: crypto.randomUUID(), name: file.name, type: file.type, url };
    });
  }
  return (
    <SellerDemoContext.Provider
      value={{
        orders,
        menus,
        slots,
        transition,
        saveMenu,
        hideMenu: (id) =>
          setMenus((current) =>
            current.map((menu) =>
              menu.id === id ? { ...menu, status: "HIDDEN" } : menu,
            ),
          ),
        addSlot,
        removeSlot,
        toggleSlot,
        readFiles,
        addReceipts: (id, files) => {
          const order = checkReceiptOrder(id);
          if (order.receipts.length + files.length > 10)
            throw new Error("Tối đa 10 hóa đơn mỗi đơn.");
          setOrders((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, receipts: [...item.receipts, ...files] }
                : item,
            ),
          );
        },
        removeReceipt: (id, fileId) => {
          checkReceiptOrder(id);
          setOrders((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    receipts: item.receipts.filter(
                      (file) => file.id !== fileId,
                    ),
                  }
                : item,
            ),
          );
        },
      }}
    >
      {children}
    </SellerDemoContext.Provider>
  );
}
export function useSellerDemo() {
  const context = useContext(SellerDemoContext);
  if (!context) throw new Error("SellerDemoProvider is required");
  return context;
}
