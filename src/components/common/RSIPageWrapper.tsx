"use client";

import { ReactNode } from "react";

interface RSIPageWrapperProps {
  children: ReactNode;
  pageName?: string;
}

export const RSIPageWrapper = ({ children, pageName }: RSIPageWrapperProps) => {
  return (
    <main
      className="flex flex-col max-w-full w-full items-center pt-[3.8rem] md:!pt-[5.3rem] xl:!pt-[5.3rem] 3xl:!pt-[5.8rem] md:px-8 xl:px-0 pb-10 xl:pb-8"
      role="main"
    >
      <div className="flex flex-col max-w-full w-full px-6 xsm:px-8 xl:px-0 pt-6 md:p-0">
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
