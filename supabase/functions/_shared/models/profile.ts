export interface IProfile {
  id: string;
  tier: "free" | "premium";
  subscriptionProvider?: "stripe" | "revenuecat";
  accountGithub?: {
    token?: string;
  };
  createdAt: number;
  updatedAt: number;
}
