import { useState } from "react";
import type { MissionCharacter } from "@banghub/shared";
import { getCharacterAsset } from "../../lib/characters";

type CharacterAvatarProps = {
  character: MissionCharacter;
};

type AvatarStatus = "loading" | "loaded" | "error";

export function CharacterAvatar({ character }: CharacterAvatarProps) {
  const [status, setStatus] = useState<AvatarStatus>("loading");
  const asset = getCharacterAsset(character);

  if (status === "error") {
    return (
      <span
        className="character-avatar character-avatar-fallback"
        data-character={character}
        role="img"
        aria-label={asset.alt}
      >
        {asset.initial}
      </span>
    );
  }

  return (
    <img
      className="character-avatar"
      src={asset.src}
      alt={asset.alt}
      width={96}
      height={96}
      data-loaded={status === "loaded"}
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("error")}
    />
  );
}
