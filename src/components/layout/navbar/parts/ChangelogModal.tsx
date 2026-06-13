import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SpinnerIcon } from "@/assets/icons/SpinnerIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/shadcn/dialog";

import { useChangelogModal } from "../hooks/useChangelogModal";
import { useModalKeyboardScroll } from "../hooks/useModalKeyboardScroll";
import { ChangelogModalProps } from "../types";

export const ChangelogModal = ({
  closeModal,
  returnFocusRef,
}: ChangelogModalProps) => {
  const { changelogContent, isLoading, error } = useChangelogModal();
  const { scrollRef, handleKeyDown, handleOpenAutoFocus } =
    useModalKeyboardScroll();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className="md:max-w-130 1xl:max-w-168 md:w-130 1xl:w-168 px-5 xsm:px-5 sm:px-6 md:px-10 1xl:px-12 pr-0 xsm:pr-0 sm:pr-0 pt-0 sm:pt-0 md:pt-10 1xl:pt-12 pb-0 md:pb-10 1xl:pb-12"
        onOpenAutoFocus={handleOpenAutoFocus}
        onCloseAutoFocus={(e) => {
          if (returnFocusRef?.current) {
            e.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Changelog</DialogTitle>
        <DialogDescription className="sr-only">Changelog</DialogDescription>
        <div
          ref={scrollRef}
          tabIndex={0}
          className="w-full min-w-0 h-full max-h-none md:max-h-[65vh] overflow-y-auto pl-1 pr-0 md:pr-4 [&>*]:pr-4 md:[&>*]:pr-0 pt-12 md:pt-0 focus:outline-none focus-visible:outline-none"
        >
          <div className="text-primaryText text-base md:text-sm 1xl:text-base w-full h-full text-left">
            {isLoading ? (
              <div className="flex justify-center items-center py-10 w-full h-full">
                <SpinnerIcon className="contentSpinner" />
              </div>
            ) : error ? (
              <div className="text-redBadgeText text-center py-5">{error}</div>
            ) : (
              <div className="pb-4 [&_h2]:text-primaryText [&_h2]:text-3xl [&_h2]:mb-4 [&_h3]:text-secondaryText [&_h3]:text-xl [&_h3]:mt-4 [&_h4]:text-secondaryText [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-3 [&_li]:text-primaryText [&_p]:mb-4 [&_p]:text-base [&_code]:bg-mutedBg [&_code]:px-1 [&_code]:rounded [&_pre]:bg-mutedBg [&_pre]:p-2 [&_pre]:rounded [&_pre]:my-2 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto [&_hr]:my-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {changelogContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
