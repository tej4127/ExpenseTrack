import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
    
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 7h10a2 2 0 0 1 2 2v1l1 1v2l-1 1v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1l-1-1v-2l1-1V9a2 2 0 0 1 2-2z" />
      <path d="M9 9v6" />
      <path d="M15 9v6" />
    </svg>
  );
}
