import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        loading?: boolean | string;
        animation?: string;
        "shimmer-direction"?: string;
        "shimmer-color"?: string;
        "background-color"?: string;
        duration?: number | string;
        "fallback-radius"?: number | string;
        stagger?: number | string;
        reveal?: number | string;
        count?: number | string;
        "count-gap"?: number | string;
        debug?: boolean | string;
        "loading-label"?: string;
      };
    }
  }
}
