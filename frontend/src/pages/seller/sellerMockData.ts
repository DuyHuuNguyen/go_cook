export type DemoStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "COOKING"
  | "AWAITING_ACCEPTANCE"
  | "COMPLETED"
  | "REJECTED";
export type MenuStatus = "PUBLISHED" | "DRAFT" | "HIDDEN";
export interface DemoFile {
  id: string;
  name: string;
  url: string;
  type: string;
}
export interface DemoMenu {
  id: string;
  name: string;
  category: string;
  price: number;
  minGuests: number;
  maxGuests: number;
  dishes: string;
  description: string;
  status: MenuStatus;
  images: DemoFile[];
  coverId: string;
}
export interface DemoOrder {
  id: string;
  customer: string;
  menu: string;
  guests: number;
  date: string;
  time: string;
  area: string;
  total: number;
  serviceType: "MENU" | "BUDGET";
  status: DemoStatus;
  duration: number;
  paidAt: string;
  releasedAt?: string;
  receipts: DemoFile[];
  note: string;
  history: { status: DemoStatus; at: string; note?: string }[];
}
export interface DemoSlot {
  id: string;
  date: string;
  start: string;
  end: string;
  available: boolean;
}
export const DEMO_TODAY = "2026-10-14";
export const orderLabels: Record<DemoStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  COOKING: "Đang nấu",
  AWAITING_ACCEPTANCE: "Chờ nghiệm thu",
  COMPLETED: "Đã nghiệm thu",
  REJECTED: "Đã từ chối",
};
export const menuLabels: Record<MenuStatus, string> = {
  PUBLISHED: "Đang hiển thị",
  DRAFT: "Bản nháp",
  HIDDEN: "Tạm ẩn",
};
export const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );
export const displayDate = (date: string) =>
  date.split("-").reverse().join("/");
export const orderUrl = (id: string) =>
  `/seller/order-detail?id=${encodeURIComponent(id)}`;
export const isBooked = (status: DemoStatus) =>
  [
    "CONFIRMED",
    "PREPARING",
    "COOKING",
    "AWAITING_ACCEPTANCE",
    "COMPLETED",
  ].includes(status);
export const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const endTime = (order: DemoOrder) => {
  const end = minutes(order.time) + order.duration;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
};
export const overlaps = (
  start: string,
  end: string,
  otherStart: string,
  otherEnd: string,
) => minutes(start) < minutes(otherEnd) && minutes(otherStart) < minutes(end);

const seeds: Omit<
  DemoOrder,
  "duration" | "paidAt" | "receipts" | "note" | "history"
>[] = [
  {
    id: "GC-261014-01",
    customer: "Ngọc Anh",
    menu: "Mâm cơm sum vầy",
    guests: 6,
    date: "2026-10-16",
    time: "18:00",
    area: "125 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    total: 900000,
    serviceType: "MENU",
    status: "PENDING",
  },
  {
    id: "GC-261014-02",
    customer: "Hoàng Nam",
    menu: "Tiệc gia đình cuối tuần",
    guests: 8,
    date: "2026-10-18",
    time: "11:00",
    area: "42 Võ Văn Ngân, Thủ Đức, TP.HCM",
    total: 1600000,
    serviceType: "BUDGET",
    status: "PENDING",
  },
  {
    id: "GC-261013-01",
    customer: "Minh Thư",
    menu: "Mâm cơm miền Nam",
    guests: 4,
    date: "2026-10-14",
    time: "17:00",
    area: "18 Hoa Sứ, Phú Nhuận, TP.HCM",
    total: 600000,
    serviceType: "MENU",
    status: "PREPARING",
  },
  {
    id: "GC-261012-01",
    customer: "Thanh Hà",
    menu: "Mâm chay thanh lành",
    guests: 4,
    date: "2026-10-14",
    time: "11:00",
    area: "63 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
    total: 520000,
    serviceType: "MENU",
    status: "AWAITING_ACCEPTANCE",
  },
  {
    id: "GC-261011-01",
    customer: "Bảo Trân",
    menu: "Bữa cơm nhà ấm áp",
    guests: 6,
    date: "2026-10-15",
    time: "18:00",
    area: "24 D5, Bình Thạnh, TP.HCM",
    total: 1200000,
    serviceType: "BUDGET",
    status: "CONFIRMED",
  },
  {
    id: "GC-261010-01",
    customer: "Thu Hương",
    menu: "Mâm cơm sum vầy",
    guests: 4,
    date: "2026-10-11",
    time: "18:00",
    area: "Quận 1, TP.HCM",
    total: 1000000,
    serviceType: "MENU",
    status: "COMPLETED",
    releasedAt: "2026-10-11",
  },
  {
    id: "GC-261009-01",
    customer: "Đức Minh",
    menu: "Tiệc nhỏ tại gia",
    guests: 8,
    date: "2026-10-12",
    time: "11:00",
    area: "Quận 7, TP.HCM",
    total: 1400000,
    serviceType: "BUDGET",
    status: "REJECTED",
  },
  {
    id: "GC-260912-01",
    customer: "Hồng Nhung",
    menu: "Tiệc gia đình",
    guests: 10,
    date: "2026-09-15",
    time: "11:00",
    area: "Quận 3, TP.HCM",
    total: 2000000,
    serviceType: "BUDGET",
    status: "COMPLETED",
    releasedAt: "2026-09-15",
  },
  {
    id: "GC-260819-01",
    customer: "Quốc Bảo",
    menu: "Mâm cơm miền Nam",
    guests: 6,
    date: "2026-08-21",
    time: "18:00",
    area: "Quận 1, TP.HCM",
    total: 1500000,
    serviceType: "MENU",
    status: "COMPLETED",
    releasedAt: "2026-08-21",
  },
];
const paymentDate = (id: string) =>
  "20" + id.slice(3, 5) + "-" + id.slice(5, 7) + "-" + id.slice(7, 9);
const progress: DemoStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "COOKING",
  "AWAITING_ACCEPTANCE",
  "COMPLETED",
];
export const initialChefOrders: DemoOrder[] = seeds.map((order) => ({
  ...order,
  duration: 120,
  paidAt: paymentDate(order.id),
  receipts: [],
  note: "Gia đình ăn ít cay, vui lòng để riêng nước chấm. Thông tin khách hàng là dữ liệu giả lập.",
  history: (order.status === "REJECTED"
    ? (["PENDING", "REJECTED"] as DemoStatus[])
    : progress.slice(0, progress.indexOf(order.status) + 1)
  ).map((status) => ({
    status,
    at: `${status === "PENDING" || status === "CONFIRMED" || status === "REJECTED" ? paymentDate(order.id) : order.date}T09:00:00+07:00`,
  })),
}));
const photo = (id: string, name: string, url: string): DemoFile => ({
  id,
  name,
  url,
  type: "image/png",
});
export const initialMenus: DemoMenu[] = [
  {
    id: "MENU-01",
    name: "Mâm cơm sum vầy",
    category: "Món miền Nam",
    price: 150000,
    minGuests: 3,
    maxGuests: 12,
    dishes: "Cá lóc kho tộ\nCanh chua tôm\nRau muống xào tỏi\nThịt luộc",
    description:
      "Bữa cơm gia đình đậm vị miền Nam, chăm chút từ nguyên liệu đến cách trình bày.",
    status: "PUBLISHED",
    images: [
      photo("img-1", "Mâm cơm gia đình", "/assets/family.png"),
      photo("img-2", "Món ăn trong thực đơn", "/assets/meal.png"),
    ],
    coverId: "img-1",
  },
  {
    id: "MENU-02",
    name: "Mâm chay thanh lành",
    category: "Món chay",
    price: 130000,
    minGuests: 2,
    maxGuests: 8,
    dishes: "Đậu hũ sốt nấm\nCanh rau củ\nGỏi cuốn chay\nCơm gạo lứt",
    description: "Thực đơn nhẹ nhàng, tươi ngon dành cho cả gia đình.",
    status: "PUBLISHED",
    images: [photo("img-3", "Thực đơn chay", "/assets/vegetarian.png")],
    coverId: "img-3",
  },
  {
    id: "MENU-03",
    name: "Hương vị miền Bắc",
    category: "Món miền Bắc",
    price: 180000,
    minGuests: 4,
    maxGuests: 10,
    dishes: "Thịt đông\nCanh mọc\nNem rán",
    description: "Mâm cơm truyền thống cho những ngày sum họp.",
    status: "DRAFT",
    images: [photo("img-4", "Mâm cơm", "/assets/meal.png")],
    coverId: "img-4",
  },
  {
    id: "MENU-04",
    name: "Bữa tiệc miền Trung",
    category: "Món miền Trung",
    price: 190000,
    minGuests: 4,
    maxGuests: 12,
    dishes: "Bún bò\nNem lụi\nBánh bèo",
    description: "Đậm đà hương vị miền Trung.",
    status: "HIDDEN",
    images: [photo("img-5", "Bữa tiệc", "/assets/family.png")],
    coverId: "img-5",
  },
];
export const initialSlots: DemoSlot[] = Array.from(
  { length: 21 },
  (_, index) => ({
    id: `slot-${index}`,
    date: `2026-10-${String(index + 10).padStart(2, "0")}`,
    start: "09:00",
    end: "21:00",
    available: true,
  }),
);
export const categories = [
  "Món miền Nam",
  "Món miền Bắc",
  "Món miền Trung",
  "Món chay",
];

export function summarizeRevenue(
  orders: DemoOrder[],
  from: string,
  to: string,
) {
  const paid = orders.filter(
    (order) =>
      order.status !== "REJECTED" && order.paidAt >= from && order.paidAt <= to,
  );
  const released = orders.filter(
    (order) =>
      order.status === "COMPLETED" &&
      order.releasedAt &&
      order.releasedAt >= from &&
      order.releasedAt <= to,
  );
  const share = (order: DemoOrder) =>
    (Math.round(order.total * 100) - Math.round(order.total * 100 * 0.15)) /
    100;
  return {
    paid: paid.reduce((sum, order) => sum + order.total, 0),
    held: paid
      .filter((order) => order.status !== "COMPLETED")
      .reduce((sum, order) => sum + order.total, 0),
    earned: released.reduce((sum, order) => sum + share(order), 0),
    released,
    menuCount: paid.filter((order) => order.serviceType === "MENU").length,
    budgetCount: paid.filter((order) => order.serviceType === "BUDGET").length,
    share,
  };
}
