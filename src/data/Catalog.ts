export const CATEGORY_ICONS: Record<string, string> = {
  trackers: "📍",
  dashcams: "🎥",
  sensors: "🌡️",
  obd: "🔌",
  cameras: "📷",
  modems: "📶",
  batteries: "🔋",
  antennas: "📡",
  accessories: "🧰",
};

export const DEFAULT_CATEGORY_ICON = "🏷️";

export interface Product {
  id: string;
  image: string;
  title: string;
  details: string[];
  category: string; // Category slug
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    image: "/images/tracker-1.png",
    title: "GT06 GPS Tracker",
    details: ["4G LTE", "IP67", "3000 mAh battery"],
    category: "trackers",
  },
  {
    id: "2",
    image: "/images/tracker-2.png",
    title: "TK905 Solar Tracker",
    details: ["Solar powered", "IP68", "GPS + GLONASS"],
    category: "trackers",
  },
  {
    id: "3",
    image: "/images/obd-1.png",
    title: "OBD Mini Tracker",
    details: ["OBD-II plug-in", "Real-time alerts", "CAN-BUS"],
    category: "obd",
  },
  {
    id: "4",
    image: "/images/dashcam-1.png",
    title: "DC200 Dash Cam",
    details: ["1080p", "Night vision", "Loop recording"],
    category: "dashcams",
  },
  {
    id: "5",
    image: "/images/sensor-1.png",
    title: "Temp & Humidity Sensor",
    details: ["Bluetooth 5.0", "-40°C to 85°C", "2 year battery life"],
    category: "sensors",
  },
  {
    id: "6",
    image: "/images/camera-1.png",
    title: "CamPro 4G Camera",
    details: ["4G", "PIR motion", "Solar compatible"],
    category: "cameras",
  },
  {
    id: "7",
    image: "/images/modem-1.png",
    title: "RM500 5G Modem",
    details: ["5G Sub-6", "Dual SIM", "Gigabit Ethernet"],
    category: "modems",
  },
  {
    id: "8",
    image: "/images/battery-1.png",
    title: "Li-Ion 5000mAh Pack",
    details: ["Rechargeable", "Fast charge", "Compact"],
    category: "batteries",
  },
  {
    id: "9",
    image: "/images/antenna-1.png",
    title: "GNSS External Antenna",
    details: ["SMA connector", "3m cable", "Magnetic mount"],
    category: "antennas",
  },
];