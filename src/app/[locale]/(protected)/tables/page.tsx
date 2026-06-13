import { Metadata } from "next";

import { PageWrapper } from "@/components/common/PageWrapper";

const TablesPage = () => {
  return (
    <PageWrapper pageName="Tables">
      <div className="flex h-full items-center justify-center text-secondaryText">
        Tables — coming soon
      </div>
    </PageWrapper>
  );
};

export const metadata: Metadata = { title: "Tables" };

export default TablesPage;
