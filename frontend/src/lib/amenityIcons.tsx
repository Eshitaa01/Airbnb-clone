import {
  Wifi, ChefHat, WashingMachine, Wind, ParkingCircle, Snowflake, Waves, Bath,
  Dumbbell, Laptop, Tv, Flame, PawPrint, Umbrella, Mountain, Coffee, Zap, DoorOpen, Check,
} from "lucide-react";

export const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  kitchen: ChefHat,
  washer: WashingMachine,
  dryer: Wind,
  parking: ParkingCircle,
  ac: Snowflake,
  pool: Waves,
  "hot-tub": Bath,
  gym: Dumbbell,
  desk: Laptop,
  tv: Tv,
  fireplace: Flame,
  pets: PawPrint,
  beach: Umbrella,
  mountain: Mountain,
  breakfast: Coffee,
  ev: Zap,
  balcony: DoorOpen,
};

export function getAmenityIcon(icon: string) {
  return AMENITY_ICONS[icon] || Check;
}
