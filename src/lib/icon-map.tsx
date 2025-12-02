import type { IconType } from "react-icons";
import {
  PiPaintBrushBroadBold,
  PiAtomBold,
  PiMusicNotesSimpleBold,
  PiTreeEvergreenBold,
  PiChalkboardTeacherBold,
  PiHeartbeatBold,
  PiMicrophoneStageBold,
  PiCookingPotBold,
  PiWaveSawtoothBold,
  PiGlobeHemisphereWestBold,
  PiBookOpenTextBold,
  PiShieldCheckBold,
} from "react-icons/pi";

export const ICON_OPTIONS: Record<
  string,
  { label: string; icon: IconType }
> = {
  paint: { label: "Art & Craft", icon: PiPaintBrushBroadBold },
  science: { label: "Science Lab", icon: PiAtomBold },
  music: { label: "Music & Movement", icon: PiMusicNotesSimpleBold },
  outdoor: { label: "Outdoor Adventure", icon: PiTreeEvergreenBold },
  classroom: { label: "Smart Classroom", icon: PiChalkboardTeacherBold },
  wellness: { label: "Wellness Lab", icon: PiHeartbeatBold },
  studio: { label: "Creative Studio", icon: PiMicrophoneStageBold },
  cooking: { label: "Mini Chef", icon: PiCookingPotBold },
  water: { label: "Water Play", icon: PiWaveSawtoothBold },
  trip: { label: "Field Trip", icon: PiGlobeHemisphereWestBold },
  story: { label: "Story Lab", icon: PiBookOpenTextBold },
  shield: { label: "Security", icon: PiShieldCheckBold },
};

export function resolveIcon(key: string): IconType {
  return ICON_OPTIONS[key]?.icon ?? PiShieldCheckBold;
}
