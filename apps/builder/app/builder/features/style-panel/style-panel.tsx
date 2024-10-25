import {
  theme,
  Box,
  Card,
  Text,
  Separator,
  ScrollArea,
} from "@webstudio-is/design-system";
import { useStore } from "@nanostores/react";
import { computed } from "nanostores";
import type { HtmlTags } from "html-tags";
import {
  setProperty,
  deleteProperty,
  createBatchUpdate,
} from "./shared/use-style-data";
import { StyleSourcesSection } from "./style-source-section";
import { $selectedInstanceRenderState } from "~/shared/nano-states";
import {
  $selectedInstanceIntanceToTag,
  $selectedInstanceSelector,
} from "~/shared/nano-states";
import { sections } from "./sections";
import { useParentStyle } from "./parent-style";
import { useStyleInfo, type StyleInfo } from "./shared/style-info";
import { toValue } from "@webstudio-is/css-engine";

const $selectedInstanceTag = computed(
  [$selectedInstanceSelector, $selectedInstanceIntanceToTag],
  (instanceSelector, instanceToTag) => {
    if (instanceSelector === undefined || instanceToTag === undefined) {
      return;
    }
    return instanceToTag.get(instanceSelector[0]);
  }
);

const shouldRenderCategory = (
  category: string,
  parentStyle: StyleInfo,
  tag: undefined | HtmlTags
) => {
  switch (category) {
    case "flexChild":
      return toValue(parentStyle.display?.value).includes("flex");
    case "listItem":
      return tag === "ul" || tag === "ol" || tag === "li";
  }
  return true;
};

export const StylePanel = () => {
  const currentStyle = useStyleInfo();

  const selectedInstanceRenderState = useStore($selectedInstanceRenderState);
  const selectedInstanceTag = useStore($selectedInstanceTag);
  const parentStyle = useParentStyle();

  // If selected instance is not rendered on the canvas,
  // style panel will not work, because it needs the element in DOM in order to work.
  // See <SelectedInstanceConnector> for more details.
  if (selectedInstanceRenderState === "notMounted") {
    return (
      <Box css={{ p: theme.spacing[5] }}>
        <Card css={{ p: theme.spacing[9], width: "100%" }}>
          <Text>Select an instance on the canvas</Text>
        </Card>
      </Box>
    );
  }

  const all = [];

  for (const [category, { Section }] of sections.entries()) {
    if (shouldRenderCategory(category, parentStyle, selectedInstanceTag)) {
      all.push(
        <Section
          key={category}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
          createBatchUpdate={createBatchUpdate}
          currentStyle={currentStyle}
        />
      );
    }
  }

  return (
    <>
      <Box css={{ padding: theme.panel.padding }}>
        <Text variant="titles" css={{ paddingBlock: theme.panel.paddingBlock }}>
          Style Sources
        </Text>
        <StyleSourcesSection />
      </Box>
      <Separator />
      <ScrollArea>{all}</ScrollArea>
    </>
  );
};
