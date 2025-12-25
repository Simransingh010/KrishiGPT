"use client";

import Image from "next/image";

interface LogoProps {
    size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 },
    lg: { width: 180, height: 60 },
    xl: { width: 220, height: 70 },
};

export default function Logo3D({ size = "md" }: LogoProps) {
    const { width, height } = sizes[size];

    return (
        <Image
            src="/logo.png"
            alt="KrishiGPT"
            width={width}
            height={height}
            className="object-contain"
            priority
        />
    );
}
