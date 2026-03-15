import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: "google" | "github";
  picture?: string;
}

interface GitHubTokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export class AuthService {
  private googleClient: OAuth2Client;
  private jwtSecret: string;

  constructor() {
    this.jwtSecret =
      process.env.JWT_SECRET || "default-secret-do-not-use-in-prod";
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  // --- Token Management ---

  generateToken(user: UserProfile): string {
    return jwt.sign(user, this.jwtSecret, { expiresIn: "7d" });
  }

  verifyToken(token: string): UserProfile | null {
    try {
      return jwt.verify(token, this.jwtSecret) as UserProfile;
    } catch (error) {
      return null;
    }
  }

  // --- Providers ---

  async verifyGoogleToken(accessToken: string): Promise<UserProfile> {
    try {
      // With Implicit Flow (access_token), we need to fetch userinfo manually
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const payload = (await response.json()) as any;

      if (!payload || !payload.email) {
        throw new Error("Invalid Google Token");
      }

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || "User",
        picture: payload.picture,
        provider: "google",
      };
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw new Error("Failed to verify Google token");
    }
  }

  // Placeholder for GitHub
  async verifyGithubToken(code: string): Promise<UserProfile> {
    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        },
      );

      const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;
      if (tokenData.error || !tokenData.access_token) {
        throw new Error(
          tokenData.error_description || "Failed to exchange GitHub code",
        );
      }

      // 2. Fetch User Profile
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = (await userResponse.json()) as GitHubUser;

      // 3. Fetch User Emails (if email is private)
      let email = userData.email;
      if (!email) {
        const emailsResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          },
        );
        const emails = (await emailsResponse.json()) as GitHubEmail[];
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary ? primary.email : emails[0].email;
      }

      return {
        id: String(userData.id),
        email: email || "no-email-found@github.com",
        name: userData.name || userData.login,
        picture: userData.avatar_url,
        provider: "github",
      };
    } catch (error) {
      console.error("GitHub Auth Error Details:", error);
      if (!process.env.GITHUB_CLIENT_ID)
        console.error("Missing GITHUB_CLIENT_ID");
      if (!process.env.GITHUB_CLIENT_SECRET)
        console.error("Missing GITHUB_CLIENT_SECRET");
      throw new Error(
        `Failed to verify GitHub token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
