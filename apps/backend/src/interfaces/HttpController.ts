import { AnalyzeDocumentUseCase } from "../usecases/AnalyzeDocument";
import { NegotiateParamsUseCase } from "../usecases/NegotiateParams";
import { AIService } from "../infrastructure/AIService";
import { FileParserService } from "../infrastructure/FileParserService";
import { AuthService } from "../infrastructure/AuthService";
import { UserModel } from "../infrastructure/schemas/UserSchema";

const aiService = new AIService();
const fileParser = new FileParserService();
const analyzeUseCase = new AnalyzeDocumentUseCase(aiService, fileParser);
const negotiateUseCase = new NegotiateParamsUseCase(aiService);

const authService = new AuthService();

export class HttpController {
  static async handleLogin(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as any;
      const { provider, token } = body;

      if (!token) {
        return new Response(JSON.stringify({ error: "Missing token" }), {
          status: 400,
        });
      }

      let user;
      if (provider === "google") {
        user = await authService.verifyGoogleToken(token);
      } else if (provider === "github") {
        user = await authService.verifyGithubToken(token);
      } else {
        return new Response(JSON.stringify({ error: "Unsupported provider" }), {
          status: 400,
        });
      }

      // Generate Session Token
      // 2. Upsert User in MongoDB
      const dbUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          email: user.email,
          name: user.name,
          provider: user.provider,
          providerId: user.id || "unknown",
          picture: user.picture,
          // Do not overwrite credits here, only on creation default is 0
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      // Force credits to be a number (sometimes null if schema changed)
      const userProfile = {
        ...dbUser.toObject(),
        credits: dbUser.credits || 0,
      };

      // Generate Session Token
      const sessionToken = authService.generateToken({
        ...user,
        credits: userProfile.credits,
      } as any);

      return new Response(
        JSON.stringify({ token: sessionToken, user: userProfile }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Login error:", error);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
      });
    }
  }

  static async handleAnalyze(req: Request): Promise<Response> {
    try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof Blob)) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), {
          status: 400,
        });
      }

      // Convert Blob to Node Buffer for pdf-parse/mammoth
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type;

      const result = await analyzeUseCase.execute(buffer, mimeType);

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Analysis error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }

  static async handleNegotiate(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as any;
      const { clauses } = body;

      if (!clauses || !Array.isArray(clauses)) {
        return new Response(JSON.stringify({ error: "Invalid clauses data" }), {
          status: 400,
        });
      }

      const result = await negotiateUseCase.execute(clauses);

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Negotiation error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }
  static async handleGetProfile(req: Request): Promise<Response> {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing token" }), {
          status: 401,
        });
      }

      const token = authHeader.split(" ")[1];
      const payload = authService.verifyToken(token);

      if (!payload || !payload.email) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
        });
      }

      // Fetch fresh data from DB
      const userDoc = await UserModel.findOne({ email: payload.email });
      if (!userDoc) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const userProfile = {
        ...userDoc.toObject(),
        credits: userDoc.credits || 0,
      };

      return new Response(JSON.stringify({ user: userProfile }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      // Fallback: Token is valid but maybe DB lookup failed, return payload with warning?
      // For now, failure is safer.
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
      });
    }
  }
}
