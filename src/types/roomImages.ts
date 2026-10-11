export const ROOM_TYPES = ["vajra", "garuda", "arohana", "madhurya", "maayukha"] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  vajra: "Vajra",
  garuda: "Garuda",
  arohana: "Arohana",
  madhurya: "Madhurya",
  maayukha: "Maayukha",
};

export const ROOM_IMAGE_DESTINATIONS = ["homepage", "roomsPage", "gallery"] as const;

export type RoomImageDestination = (typeof ROOM_IMAGE_DESTINATIONS)[number];

export type RoomImageSelections = Record<RoomImageDestination, boolean>;

export type RoomImage = {
  id: string;
  roomType: RoomType;
  filename: string;
  storageKey: string;
  url: string;
  altText: string;
  displayOrder: number;
  active: boolean;
  selections: RoomImageSelections;
};

export type RoomImageLoadResult = {
  images: RoomImage[];
  warnings: string[];
};

export type RoomImageSettingsRecord = {
  roomType: RoomType;
  selections: RoomImageSelections;
  displayOrder: number;
};

export type RoomImageRepository = {
  listImages(): Promise<RoomImageLoadResult>;
  updateSelection(
    imageId: string,
    destination: RoomImageDestination,
    selected: boolean,
  ): Promise<RoomImageLoadResult>;
  subscribe(listener: () => void): () => void;
};

export class RoomImageRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoomImageRepositoryError";
  }
}

export class RoomImageValidationError extends RoomImageRepositoryError {
  constructor(message: string) {
    super(message);
    this.name = "RoomImageValidationError";
  }
}
