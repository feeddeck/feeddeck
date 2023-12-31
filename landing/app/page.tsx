import Image from "next/image";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const Download = dynamic(() => import("@/components/download"), { ssr: false });
import { generalMetadata } from "@/helpers/metadata";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Follow your RSS and Social Media Feeds",
};

export default function Home() {
  return (
    <main>
      <div
        className="container p-8 mx-auto flex flex-wrap"
        style={{ minHeight: "calc(100vh - 108px)" }}
      >
        <div className="flex items-center w-full lg:w-1/2">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl font-bold leading-snug tracking-tight lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight">
              Follow your RSS and Social Media Feeds
            </h1>
            <p className="py-5 text-xl leading-normal text-gray-400 lg:text-xl xl:text-2xl">
              FeedDeck is an open source RSS and social media feed reader,
              inspired by TweetDeck. FeedDeck allows you to follow your favorite
              feeds in one place on all platforms.
            </p>

            <div className="flex flex-col items-start space-y-3 sm:space-x-4 sm:space-y-0 sm:items-center sm:flex-row">
              <a
                href="https://app.feeddeck.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 text-lg font-medium text-center text-onprimary bg-primary rounded-full"
              >
                Sign In
              </a>
              <Download />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <div className="p-2 bg-secondary rounded-lg">
            <Image
              src="/hero-1.webp"
              width="616"
              height="616"
              className="object-cover"
              alt="Hero"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div id="features">
        <div className="flex flex-col justify-center text-onsecondary bg-secondary p-16">
          <div className="text-xl text-center">
            All your favorite feeds in one place
          </div>

          <div className="flex flex-wrap justify-center gap-20 mt-10">
            <GitHub />
            <GoogleNews />
            <Mastodon />
            <Medium />
            <Nitter />
            <Pinterest />
            <Reddit />
            <RSS />
            <StackOverflow />
            <Tumblr />
            <X />
            <YouTube />
          </div>
        </div>
      </div>

      <div>
        <Feature
          title="Deck View"
          description="View all your RSS and social media feeds in a deck layout."
          image="/feature-1.webp"
        />
        <Feature
          title="Details View"
          description="View the details of all your RSS and social media items."
          image="/feature-2.webp"
        />
        <Feature
          title="YouTube"
          description="Follow and view your favorite YouTube channels."
          image="/feature-3.webp"
        />
        <Feature
          title="Podcasts"
          description="Follow and listen to your favorite podcasts, via the built-in podcast player."
          image="/feature-4.webp"
        />
        <Feature
          title="GitHub"
          description="View your GitHub notifications and activities of your favorite repositories."
          image="/feature-5.webp"
        />
        <Feature
          title="Available on all Platforms"
          description="The same experience on all your devices."
          image="/feature-6.webp"
          noBg={true}
        />
      </div>

      <div>
        <div className="flex flex-col justify-center text-onsecondary bg-secondary p-16">
          <div className="flex flex-wrap justify-center gap-20 mt-10">
            <a
              href="https://app.feeddeck.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-lg font-medium text-center text-onprimary bg-primary rounded-full"
            >
              Sign In
            </a>
            <Download />
          </div>
        </div>
      </div>
    </main>
  );
}

const Feature = (
  { title, description, image, noBg }: {
    title: string;
    description: string;
    image: string;
    noBg?: boolean;
  },
) => (
  <div className="container mx-auto flex flex-col justify-center p-16 items-center text-center">
    <div className="mb-2 text-4xl tracking-tight font-extrabold">
      {title}
    </div>
    <div className="mb-5 font-light text-gray-400 sm:text-xl">
      {description}
    </div>
    <div className={noBg ? "p-2 rounded-lg" : "p-2 bg-secondary rounded-lg"}>
      <Image
        src={image}
        width={0}
        height={0}
        style={{ width: "100%", height: "auto" }}
        className="object-cover"
        alt="Feature"
        loading="eager"
      />
    </div>
  </div>
);

const GitHub = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="GitHub" transform="matrix(8.25806,0,0,8.25806,0,-14.8952)">
        <path d="M165.9,397.4C165.9,399.4 163.6,401 160.7,401C157.4,401.3 155.1,399.7 155.1,397.4C155.1,395.4 157.4,393.8 160.3,393.8C163.3,393.5 165.9,395.1 165.9,397.4ZM134.8,392.9C134.1,394.9 136.1,397.2 139.1,397.8C141.7,398.8 144.7,397.8 145.3,395.8C145.9,393.8 144,391.5 141,390.6C138.4,389.9 135.5,390.9 134.8,392.9ZM179,391.2C176.1,391.9 174.1,393.8 174.4,396.1C174.7,398.1 177.3,399.4 180.3,398.7C183.2,398 185.2,396.1 184.9,394.1C184.6,392.2 181.9,390.9 179,391.2ZM244.8,8C106.1,8 0,113.3 0,252C0,362.9 69.8,457.8 169.5,491.2C182.3,493.5 186.8,485.6 186.8,479.1C186.8,472.9 186.5,438.7 186.5,417.7C186.5,417.7 116.5,432.7 101.8,387.9C101.8,387.9 90.4,358.8 74,351.3C74,351.3 51.1,335.6 75.6,335.9C75.6,335.9 100.5,337.9 114.2,361.7C136.1,400.3 172.8,389.2 187.1,382.6C189.4,366.6 195.9,355.5 203.1,348.9C147.2,342.7 90.8,334.6 90.8,238.4C90.8,210.9 98.4,197.1 114.4,179.5C111.8,173 103.3,146.2 117,111.6C137.9,105.1 186,138.6 186,138.6C206,133 227.5,130.1 248.8,130.1C270.1,130.1 291.6,133 311.6,138.6C311.6,138.6 359.7,105 380.6,111.6C394.3,146.3 385.8,173 383.2,179.5C399.2,197.2 409,211 409,238.4C409,334.9 350.1,342.6 294.2,348.9C303.4,356.8 311.2,371.8 311.2,395.3C311.2,429 310.9,470.7 310.9,478.9C310.9,485.4 315.5,493.3 328.2,491C428.2,457.8 496,362.9 496,252C496,113.3 383.5,8 244.8,8ZM97.2,352.9C95.9,353.9 96.2,356.2 97.9,358.1C99.5,359.7 101.8,360.4 103.1,359.1C104.4,358.1 104.1,355.8 102.4,353.9C100.8,352.3 98.5,351.6 97.2,352.9ZM86.4,344.8C85.7,346.1 86.7,347.7 88.7,348.7C90.3,349.7 92.3,349.4 93,348C93.7,346.7 92.7,345.1 90.7,344.1C88.7,343.5 87.1,343.8 86.4,344.8ZM118.8,380.4C117.2,381.7 117.8,384.7 120.1,386.6C122.4,388.9 125.3,389.2 126.6,387.6C127.9,386.3 127.3,383.3 125.3,381.4C123.1,379.1 120.1,378.8 118.8,380.4ZM107.4,365.7C105.8,366.7 105.8,369.3 107.4,371.6C109,373.9 111.7,374.9 113,373.9C114.6,372.6 114.6,370 113,367.7C111.6,365.4 109,364.4 107.4,365.7Z" />
      </g>
    </svg>
    <div className="pt-4">GitHub</div>
  </div>
);

const GoogleNews = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g
        id="Google-News"
        transform="matrix(8.25806,0,0,8.25806,33.0323,-66.0645)"
      >
        <path d="M488,261.8C488,403.3 391.1,504 248,504C110.8,504 0,393.2 0,256C0,118.8 110.8,8 248,8C314.8,8 371,32.5 414.3,72.9L346.8,137.8C258.5,52.6 94.3,116.6 94.3,256C94.3,342.5 163.4,412.6 248,412.6C346.2,412.6 383,342.2 388.8,305.7L248,305.7L248,220.4L484.1,220.4C486.4,233.1 488,245.3 488,261.8Z" />
      </g>
    </svg>
    <div className="pt-4">Google News</div>
  </div>
);

const Mastodon = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Mastodon" transform="matrix(9.14139,0,0,9.14139,0.178535,-292.5)">
        <path d="M433,179.11C433,81.91 369.29,53.41 369.29,53.41C306.77,24.71 140.73,25.01 78.81,53.41C78.81,53.41 15.09,81.91 15.09,179.11C15.09,294.81 8.49,438.51 120.72,468.21C161.23,478.91 196.04,481.21 224.05,479.61C274.86,476.81 303.37,461.51 303.37,461.51L301.67,424.61C301.67,424.61 265.36,436.01 224.55,434.71C184.14,433.31 141.55,430.31 134.92,380.71C134.305,376.102 134.005,371.458 134.02,366.81C219.65,387.71 292.67,375.91 312.77,373.51C368.89,366.81 417.77,332.21 424,300.61C433.8,250.81 433,179.11 433,179.11ZM357.88,304.31L311.25,304.31L311.25,190.11C311.25,140.41 247.25,138.51 247.25,197.01L247.25,259.51L200.92,259.51L200.92,197C200.92,138.5 136.92,140.4 136.92,190.1L136.92,304.3L90.19,304.3C90.19,182.2 84.99,156.4 108.6,129.3C134.5,100.4 188.42,98.5 212.43,135.4L224.03,154.9L235.63,135.4C259.74,98.3 313.75,100.6 339.46,129.3C363.17,156.6 357.86,182.3 357.86,304.3L357.88,304.31Z" />
      </g>
    </svg>
    <div className="pt-4">Mastodon</div>
  </div>
);

const Medium = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Medium" transform="matrix(6.4,0,0,6.4,9.09495e-13,409.6)">
        <path d="M180.5,74.262C80.813,74.262 0,155.633 0,256C0,356.367 80.819,437.738 180.5,437.738C280.181,437.738 361,356.373 361,256C361,155.627 280.191,74.262 180.5,74.262ZM468.75,84.908C418.905,84.908 378.505,161.527 378.505,256.003C378.505,350.479 418.911,427.103 468.756,427.103C518.601,427.103 559.007,350.484 559.007,256.003L559,256.003C559,161.5 518.6,84.908 468.752,84.908L468.75,84.908ZM608.256,102.729C590.73,102.729 576.521,171.357 576.521,256.003C576.521,340.649 590.721,409.277 608.256,409.277C625.791,409.277 640,340.631 640,256C640,171.351 625.785,102.729 608.258,102.729L608.256,102.729Z" />
      </g>
    </svg>
    <div className="pt-4">Medium</div>
  </div>
);

const Nitter = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Nitter" transform="matrix(7.0137,0,0,7.0137,-289.9,-289.9)">
        <path d="M98.133,44.8L94.667,48.4L94.667,618.267L98.133,621.867L101.733,625.334L218.267,625.334L221.867,621.867L225.333,618.267L225.333,453.2C225.333,316.4 225.6,288 227.067,288C228.133,288 281.867,362.8 346.667,454.267C411.334,545.867 465.6,621.734 467.2,622.934C469.734,625.067 474.534,625.334 517.467,625.334L564.934,625.334L568.534,621.867L572,618.267L572,48.4L568.534,44.8L564.934,41.333L448.4,41.333L444.8,44.8L441.334,48.4L441.334,213.467C441.334,350.267 441.067,378.667 439.6,378.667C438.534,378.667 384.8,303.867 320,212.267C255.333,120.8 201.067,44.933 199.467,43.733C196.933,41.6 192.133,41.333 149.2,41.333L101.733,41.333L98.133,44.8ZM310,240.933C378.267,337.334 435.867,418.4 438.134,420.8C442,424.934 442.934,425.334 450.267,425.334C457.2,425.334 458.8,424.8 461.867,421.867L465.334,418.267L465.334,65.333L548,65.333L548,601.334L514.4,601.2L480.667,601.2L356.667,425.734C288.533,329.333 230.8,248.267 228.533,245.867C224.667,241.733 223.733,241.333 216.4,241.333C209.467,241.333 207.867,241.867 204.8,244.8L201.333,248.4L201.333,601.334L118.667,601.334L118.667,65.333L152.4,65.467L186,65.467L310,240.933Z" />
      </g>
    </svg>
    <div className="pt-4">Nitter</div>
  </div>
);

const Pinterest = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Pinterest" transform="matrix(8.20665,0,0,8.20665,472.324,-53.3432)">
        <path d="M204,6.5C101.4,6.5 0,74.9 0,185.6C0,256 39.6,296 63.6,296C73.5,296 79.2,268.4 79.2,260.6C79.2,251.3 55.5,231.5 55.5,192.8C55.5,112.4 116.7,55.4 195.9,55.4C264,55.4 314.4,94.1 314.4,165.2C314.4,218.3 293.1,317.9 224.1,317.9C199.2,317.9 177.9,299.9 177.9,274.1C177.9,236.3 204.3,199.7 204.3,160.7C204.3,94.5 110.4,106.5 110.4,186.5C110.4,203.3 112.5,221.9 120,237.2C106.2,296.6 78,385.1 78,446.3C78,465.2 80.7,483.8 82.5,502.7C85.9,506.5 84.2,506.1 89.4,504.2C139.8,435.2 138,421.7 160.8,331.4C173.1,354.8 204.9,367.4 230.1,367.4C336.3,367.4 384,263.9 384,170.6C384,71.3 298.2,6.5 204,6.5Z" />
      </g>
    </svg>
    <div className="pt-4">Pinterest</div>
  </div>
);

const Reddit = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Reddit" transform="matrix(8.63308,0,0,8.63308,-161.895,-161.638)">
        <path d="M440.3,203.5C425.3,203.5 412.1,209.7 402.4,219.4C366.7,194.7 318.6,178.8 265.3,177.1L293,52.3L381.2,72.1C381.2,93.7 398.8,111.3 420.4,111.3C442.4,111.3 460.1,93.2 460.1,71.6C460.1,50 442.5,31.9 420.4,31.9C405,31.9 391.7,41.2 385.1,53.9L287.7,32.3C282.8,31 278,34.5 276.7,39.4L246.3,177C193.4,179.2 145.8,195.1 110,219.8C100.3,209.7 86.6,203.5 71.6,203.5C16,203.5 -2.2,278.1 48.7,303.6C46.9,311.5 46.1,319.9 46.1,328.3C46.1,412.1 140.5,480 256.4,480C372.8,480 467.2,412.1 467.2,328.3C467.2,319.9 466.3,311.1 464.1,303.2C514,277.6 495.6,203.5 440.3,203.5ZM129.4,308.9C129.4,286.9 147,269.2 169.1,269.2C190.7,269.2 208.3,286.8 208.3,308.9C208.3,330.5 190.7,348.1 169.1,348.1C147.1,348.2 129.4,330.5 129.4,308.9ZM343.7,402.4C307.3,438.8 204.6,438.8 168.2,402.4C164.2,398.9 164.2,392.7 168.2,388.7C171.7,385.2 177.9,385.2 181.4,388.7C209.2,417.2 301.4,417.7 330.4,388.7C333.9,385.2 340.1,385.2 343.6,388.7C347.7,392.7 347.7,398.9 343.7,402.4ZM342.9,348.2C321.3,348.2 303.7,330.6 303.7,309C303.7,287 321.3,269.3 342.9,269.3C364.9,269.3 382.6,286.9 382.6,309C382.5,330.5 364.9,348.2 342.9,348.2Z" />
      </g>
    </svg>
    <div className="pt-4">Reddit</div>
  </div>
);

const RSS = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="RSS" transform="matrix(120.471,0,0,120.471,-722.824,-963.765)">
        <path d="M10.9,42C9.533,42 8.375,41.525 7.425,40.575C6.475,39.625 6,38.467 6,37.1C6,35.733 6.475,34.575 7.425,33.625C8.375,32.675 9.533,32.2 10.9,32.2C12.267,32.2 13.425,32.675 14.375,33.625C15.325,34.575 15.8,35.733 15.8,37.1C15.8,38.467 15.325,39.625 14.375,40.575C13.425,41.525 12.267,42 10.9,42ZM35.5,42C35.5,37.933 34.725,34.108 33.175,30.525C31.625,26.942 29.517,23.817 26.85,21.15C24.183,18.483 21.058,16.375 17.475,14.825C13.892,13.275 10.067,12.5 6,12.5L6,8C10.7,8 15.108,8.892 19.225,10.675C23.342,12.458 26.942,14.892 30.025,17.975C33.108,21.058 35.542,24.658 37.325,28.775C39.108,32.892 40,37.3 40,42L35.5,42ZM23.6,42C23.6,36.733 21.983,32.417 18.75,29.05C15.517,25.683 11.267,24 6,24L6,19.5C9.233,19.5 12.2,20.067 14.9,21.2C17.6,22.333 19.925,23.9 21.875,25.9C23.825,27.9 25.35,30.275 26.45,33.025C27.55,35.775 28.1,38.767 28.1,42L23.6,42Z" />
      </g>
    </svg>
    <div className="pt-4">RSS</div>
  </div>
);

const StackOverflow = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g
        id="StackOverflow"
        transform="matrix(9.14286,0,0,9.14286,292.571,-292.571)"
      >
        <path d="M290.7,311L95,269.7L86.8,309L282.5,350L290.7,311ZM341.7,224L188.2,95.7L162.7,126.5L316.2,254.8L341.7,224ZM310.5,263.7L129.2,179L112.5,215.5L293.7,300L310.5,263.7ZM262,32L230,56L349.3,216.3L381.3,192.3L262,32ZM282.5,360L82.5,360L82.5,399.7L282.5,399.7L282.5,360ZM322.2,440L42.7,440L42.7,320L2.7,320L2.7,480L362.2,480L362.2,320L322.2,320L322.2,440Z" />
      </g>
    </svg>
    <div className="pt-4">StackOverflow</div>
  </div>
);

const Tumblr = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="Tumblr" transform="matrix(8,0,0,8,768.07,1.42204e-13)">
        <path d="M309.8,480.3C296.2,494.8 259.8,512 212.4,512C91.6,512 65.4,423.2 65.4,371.4L65.4,227.4L17.9,227.4C12.4,227.4 7.9,222.9 7.9,217.4L7.9,149.4C7.9,142.2 12.4,135.8 19.2,133.4C81.2,111.6 100.7,57.4 103.5,16.3C104.3,5.3 110,-0 119.6,-0L190.5,-0C196,-0 200.5,4.5 200.5,10L200.5,125.2L283.5,125.2C289,125.2 293.5,129.6 293.5,135.1L293.5,216.8C293.5,222.3 289,226.8 283.5,226.8L200.1,226.8L200.1,360C200.1,394.2 223.8,413.6 268.1,395.8C272.9,393.9 277.1,392.6 280.8,393.6C284.3,394.5 286.6,397 288.2,401.5L310.2,465.8C312,470.8 313.5,476.4 309.8,480.3Z" />
      </g>
    </svg>
    <div className="pt-4">Tumblr</div>
  </div>
);

const X = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="X" transform="matrix(8.90048,0,0,8.90048,-238.533,-230.522)">
        <path d="M389.2,48L459.8,48L305.6,224.2L487,464L345,464L233.7,318.6L106.5,464L35.8,464L200.7,275.5L26.8,48L172.4,48L272.9,180.9L389.2,48ZM364.4,421.8L403.5,421.8L151.1,88L109.1,88L364.4,421.8Z" />
      </g>
    </svg>
    <div className="pt-4">X</div>
  </div>
);

const YouTube = () => (
  <div className="flex flex-col items-center justify-center">
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 4096 4096"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="YouTube" transform="matrix(7.49999,0,0,7.49999,-111.997,128.002)">
        <path d="M549.655,124.083C543.374,100.433 524.868,81.807 501.371,75.486C458.781,64 288,64 288,64C288,64 117.22,64 74.629,75.486C51.132,81.808 32.626,100.433 26.345,124.083C14.933,166.95 14.933,256.388 14.933,256.388C14.933,256.388 14.933,345.826 26.345,388.693C32.626,412.343 51.132,430.193 74.629,436.514C117.22,448 288,448 288,448C288,448 458.78,448 501.371,436.514C524.868,430.193 543.374,412.343 549.655,388.693C561.067,345.826 561.067,256.388 561.067,256.388C561.067,256.388 561.067,166.95 549.655,124.083ZM232.145,337.591L232.145,175.185L374.884,256.39L232.145,337.591Z" />
      </g>
    </svg>
    <div className="pt-4">YouTube</div>
  </div>
);
