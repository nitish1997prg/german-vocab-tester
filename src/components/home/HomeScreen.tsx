
import type { ComponentProps, ReactNode } from "react";

import BauhausHomeShell from "./BauhausHomeShell";
import BauhausLevelSelector from "./BauhausLevelSelector";
import ArticleWarmup from "./ArticleWarmup";


type HomeScreenProps = {
  navigation?: ReactNode;
  onSelectLevel: ComponentProps<
    typeof BauhausLevelSelector
  >["onSelectLevel"];
};

export default function HomeScreen({
  onSelectLevel,
  navigation,
}: HomeScreenProps) {
  return (
    <BauhausHomeShell navigation={navigation}>
      <div className="flex flex-col gap-6">
        <ArticleWarmup />

        <BauhausLevelSelector
          onSelectLevel={onSelectLevel}
        />
      </div>
    </BauhausHomeShell>
  );
}
