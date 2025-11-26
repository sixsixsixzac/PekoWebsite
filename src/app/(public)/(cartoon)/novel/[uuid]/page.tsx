import { createCartoonDetailRouteHandlers } from "@/app/(public)/(cartoon)/components/createCartoonDetailRoute";

const { generateMetadata, Page } = createCartoonDetailRouteHandlers({
  type: "novel",
  defaultTitle: "นิยาย",
  defaultDescription: "รายละเอียดนิยาย",
  baseKeywords: ["นิยาย", "novel"],
});

export { generateMetadata };
export default Page;
