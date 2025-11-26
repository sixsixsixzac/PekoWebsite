import { createCartoonDetailRouteHandlers } from "@/app/(public)/(cartoon)/components/createCartoonDetailRoute";

const { generateMetadata, Page } = createCartoonDetailRouteHandlers({
  type: "manga",
  defaultTitle: "มังงะ",
  defaultDescription: "รายละเอียดมังงะ",
  baseKeywords: ["มังงะ", "manga"],
});

export { generateMetadata };
export default Page;
