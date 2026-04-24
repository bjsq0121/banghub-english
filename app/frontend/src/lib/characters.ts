import type { MissionCharacter } from "@banghub/shared";

type CharacterAsset = {
  src: string;
  alt: string;
};

export const CHARACTER_ASSETS: Record<MissionCharacter, CharacterAsset> = {
  robo: {
    src: "/assets/characters/robo.svg",
    alt: "Robo the friendly robot"
  },
  dino: {
    src: "/assets/characters/dino.svg",
    alt: "Dino the playful dinosaur"
  },
  bunny: {
    src: "/assets/characters/bunny.svg",
    alt: "Bunny the encourager"
  }
};

export function getCharacterAsset(character: MissionCharacter) {
  return CHARACTER_ASSETS[character];
}
