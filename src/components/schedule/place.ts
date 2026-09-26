// How a class venue is named in copy. Shared by the session page and the booking ticket.
import type { Space } from "@/data/types";

/** Studios and the pool have proper names and get «ёлочки»; plain zones ("Кардиозона") do not. */
export const placeName = (space: Space) => (space.kind === "studio" || space.slug === "pool" ? `«${space.name}»` : space.name);

/** The label above the venue on a ticket: "Студия", "Бассейн" or "Зона". */
export const placeKind = (space: Space) => (space.kind === "studio" ? "Студия" : space.slug === "pool" ? "Бассейн" : "Зона");
