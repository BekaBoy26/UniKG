import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

export const generateMetadata = () => directoryMetadata("university");

export default function UniversitiesPage() {
  return <DirectoryPage type="university" />;
}
