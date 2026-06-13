"use client";

import { ReactNode } from "react";

interface RSIPageWrapperProps {
  children: ReactNode;
  pageName?: string;
}

export const RSIPageWrapper = ({ children, pageName }: RSIPageWrapperProps) => {
  return (
    <main
      className="flex flex-col max-w-full w-full pt-[3.8rem] md:!pt-[5.3rem] xl:!pt-[5.3rem] 3xl:!pt-[5.8rem] pb-10 xl:pb-8 animate-fade-in relative z-0 bg-mesh"
      role="main"
    >
      <div className="flex flex-col max-w-full w-full pt-6 md:pt-0">
        {pageName && (
          <h1 className="text-lg font-semibold text-primaryText mb-4">
            {pageName}
          </h1>
        )}
        <div className="flex flex-col w-full gap-y-4 1xl:gap-y-6 max-w-full">
          {children}
        </div>
      </div>
    </main>
  );
};
