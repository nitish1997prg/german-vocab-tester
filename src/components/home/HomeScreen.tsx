
import type { ComponentProps } from "react";

import BauhausHomeShell from "./BauhausHomeShell";
import BauhausLevelSelector from "./BauhausLevelSelector";

type HomeScreenProps = {
  onSelectLevel: ComponentProps<
    typeof BauhausLevelSelector
  >["onSelectLevel"];
};

export default function HomeScreen({
  onSelectLevel,
}: HomeScreenProps) {
  return (
    <BauhausHomeShell>
        <BauhausLevelSelector
        onSelectLevel={onSelectLevel}
      />
    </BauhausHomeShell>
  );
}
