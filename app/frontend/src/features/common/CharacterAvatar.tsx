import { useState } from "react";
import type { MissionCharacter } from "@banghub/shared";
import { getCharacterAsset } from "../../lib/characters";

type CharacterAvatarProps = {
  character: MissionCharacter;
};

export function CharacterAvatar({ character }: CharacterAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const asset = getCharacterAsset(character);

  return (
    <img
      className="character-avatar"
      src={asset.src}
      alt={asset.alt}
      width={96}
      height={96}
      data-loaded={loaded}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
    />
  );
}
