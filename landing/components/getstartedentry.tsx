"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GetStartedEntry({ title, images, isMobile, children }: {
  title: string;
  images: string[];
  isMobile?: boolean;
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number>(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
      <div>
        <div className="h-full flex items-center">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {children}
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <div className="h-full flex items-center justify-center">
          <div className="relative p-2 bg-secondary rounded-lg">
            <Link
              href={images[index]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={images[index]}
                width={0}
                height={0}
                style={isMobile
                  ? { width: "auto", height: "75vh" }
                  : { width: "100%", height: "auto" }}
                className="object-cover"
                alt="Image"
                loading="eager"
              />
            </Link>
            <div className="absolute flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-4 h-4 bg-secondary rounded-full"
                  onClick={() => setIndex(index)}
                >
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
