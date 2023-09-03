export interface IProfile {
  id: string;
  tier: "free" | "premium";
  accountGithub?: {
    token?: string;
  };
  createdAt: number;
  updatedAt: number;
}
