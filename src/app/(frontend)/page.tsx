import PageTemplate, { generateMetadata } from "./[slug]/page";

// Route segment config must be declared in each page file (see [slug]/page.tsx)
export const revalidate = 60;

export default PageTemplate;

export { generateMetadata };
