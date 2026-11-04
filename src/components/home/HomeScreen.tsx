
import type { ComponentProps } from "react";

import BauhausHomeShell from "./BauhausHomeShell";
import BauhausLevelSelector from "./BauhausLevelSelector";
import ArticleWarmup from "./ArticleWarmup";


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
      <div className="flex flex-col gap-6">
        <ArticleWarmup />

        <BauhausLevelSelector
          onSelectLevel={onSelectLevel}
        />
      </div>
    </BauhausHomeShell>
  );
}
