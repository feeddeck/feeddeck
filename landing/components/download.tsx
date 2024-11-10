"use client";

import dynamic from "next/dynamic";

export const Download = dynamic(() => import("@/components/downloadinternal"), { ssr: false });
