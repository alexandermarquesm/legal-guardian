import { serve } from "bun";
import { HttpController } from "./interfaces/HttpController";
import { PaymentController } from "./interfaces/PaymentController";
import { WebhookController } from "./interfaces/WebhookController";

import { connectDB } from "./infrastructure/database";

const PORT = process.env.PORT || 4000;

console.log(`Legal Guardian Backend listening on port ${PORT}`);

// Connect to Database
connectDB();

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === "/health") {
        return new Response("OK", { headers: corsHeaders });
      }

      if (url.pathname === "/api/analyze" && req.method === "POST") {
        const response = await HttpController.handleAnalyze(req);
        // Append CORS headers to response
        Object.entries(corsHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
        return response;
      }

      if (url.pathname === "/api/negotiate" && req.method === "POST") {
        const response = await HttpController.handleNegotiate(req);
        Object.entries(corsHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
        return response;
      }

      if (url.pathname === "/api/auth/login" && req.method === "POST") {
        const response = await HttpController.handleLogin(req);
        Object.entries(corsHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
        return response;
      }

      if (url.pathname === "/api/auth/profile" && req.method === "GET") {
        const response = await HttpController.handleGetProfile(req);
        Object.entries(corsHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
        return response;
      }

      if (url.pathname === "/api/payment/checkout" && req.method === "POST") {
        const response = await PaymentController.handleCheckout(req);
        Object.entries(corsHeaders).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
        return response;
      }

      if (url.pathname === "/api/payment/webhook" && req.method === "POST") {
        return WebhookController.handleWebhook(req);
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (e) {
      console.error(e);
      return new Response("Internal Error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
});
