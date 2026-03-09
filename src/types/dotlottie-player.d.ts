import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-player": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        speed?: string | number;
        mode?: "normal" | "bounce";
        background?: string;
      };
    }
  }
}

export {};
