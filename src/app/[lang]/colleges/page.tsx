import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

export const generateMetadata = () => directoryMetadata("college");

export default function CollegesPage() {
  return <DirectoryPage type="college" />;
}
