import type { MissionCharacter } from "@banghub/shared";

type CharacterAsset = {
  src: string;
  alt: string;
  displayName: string;
  initial: string;
};

export const CHARACTER_ASSETS: Record<MissionCharacter, CharacterAsset> = {
  robo: {
    src: "/assets/characters/robo.svg",
    alt: "Robo the friendly robot",
    displayName: "Robo",
    initial: "R"
  },
  dino: {
    src: "/assets/characters/dino.svg",
    alt: "Dino the playful dinosaur",
    displayName: "Dino",
    initial: "D"
  },
  bunny: {
    src: "/assets/characters/bunny.svg",
    alt: "Bunny the encourager",
    displayName: "Bunny",
    initial: "B"
  }
};

export function getCharacterAsset(character: MissionCharacter) {
  return CHARACTER_ASSETS[character];
}

export function getCharacterDisplayName(character: MissionCharacter): string {
  return CHARACTER_ASSETS[character].displayName;
}
