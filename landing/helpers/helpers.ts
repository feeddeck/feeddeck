type TPlatform = "ios" | "android";
type TOS = "ios" | "android" | "macos" | "windows" | "linux";

export const downloads = {
  "ios": "https://apps.apple.com/us/app/feeddeck/id6451055362",
  "android":
    "https://play.google.com/store/apps/details?id=app.feeddeck.feeddeck",
  "web": "https://app.feeddeck.app",
  "macos": "https://apps.apple.com/us/app/feeddeck/id6451055362",
  "windows": "https://www.microsoft.com/store/apps/9NPHPGRRCT5H",
  "linux": "https://flathub.org/en/apps/app.feeddeck.feeddeck",
};

const getPlatform = (): TPlatform | undefined => {
  const userAgent =
    typeof navigator === "undefined" || typeof window === "undefined"
      ? ""
      : navigator.userAgent || navigator.vendor || (window as any).opera || "";

  if (/android/i.test(userAgent)) return "android";

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios";
  }

  return undefined;
};

export const getOSName = (): TOS | undefined => {
  const os = getPlatform();
  if (os === "ios" || os === "android") return os;

  const platform = navigator?.userAgentData?.platform.toLowerCase().trim() ||
    navigator?.platform.toLowerCase().trim();

  if (platform.startsWith("mac")) return "macos";
  if (platform.startsWith("win")) return "windows";
  if (platform.startsWith("linux")) return "linux";

  return undefined;
};

export const getOSLabel = (os?: TOS): string | undefined => {
  switch (os) {
    case "android":
      return "Android";

    case "ios":
      return "iOS";

    case "linux":
      return "Linux";

    case "macos":
      return "macOS";

    case "windows":
      return "Windows";

    default:
      return undefined;
  }
};

export const getOSDownload = (os?: TOS): string | undefined => {
  if (!os) return undefined;
  return downloads[os];
};
