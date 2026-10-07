import { IconProps } from "../utils/types";

const svgProps = (size: number, className: string) => ({
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
});

/** Mine tab icon; inline until real art exists (Plan.md A8, [Asset]). */
export const Pickaxe: React.FC<IconProps> = ({ size = 24, className = "" }) => (
    <svg {...svgProps(size, className)}>
        <g transform="translate(14 10) rotate(45)">
            <path d="M-9 1C-5-5 5-5 9 1 5-2-5-2-9 1Z" fill="currentColor" />
            <path d="M0-1v14" strokeWidth={2.5} />
        </g>
    </svg>
);

export const SoundOn: React.FC<IconProps> = ({ size = 24, className = "" }) => (
    <svg {...svgProps(size, className)}>
        <path d="M11 5 6 9H3v6h3l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
);

export const SoundOff: React.FC<IconProps> = ({ size = 24, className = "" }) => (
    <svg {...svgProps(size, className)}>
        <path d="M11 5 6 9H3v6h3l5 4z" />
        <path d="m16 9 6 6M22 9l-6 6" />
    </svg>
);

export const Lock: React.FC<IconProps> = ({ size = 24, className = "" }) => (
    <svg {...svgProps(size, className)}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);
