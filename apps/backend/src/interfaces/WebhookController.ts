import { stripe, PACKAGES } from "../config/stripe";
import { UserModel } from "../infrastructure/schemas/UserSchema";

export class WebhookController {
  static async handleWebhook(req: Request): Promise<Response> {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return new Response("Missing signature or config", { status: 400 });
    }

    try {
      const bodyText = await req.text();
      const event = await stripe.webhooks.constructEventAsync(
        bodyText,
        signature,
        webhookSecret,
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId; // Future proofing
        const packageId = session.metadata?.packageId;
        const credits = parseInt(session.metadata?.credits || "0", 10);

        console.log(
          `💰 Payment success! Package: ${packageId}, Credits: ${credits}`,
        );

        if (userId) {
          await UserModel.findOneAndUpdate(
            { _id: userId },
            { $inc: { credits: credits } },
          );
          console.log(`✅ Credits added to user ID: ${userId}`);
        } else {
          // Fallback: If userId not valid, try to match by email if available in session
          const email =
            session.customer_details?.email || session.customer_email;
          if (email) {
            await UserModel.findOneAndUpdate(
              { email: email },
              { $inc: { credits: credits } },
            );
            console.log(`✅ Credits added by Email: ${email}`);
          } else {
            console.warn(
              "⚠️ Could not link payment to user (Missing userId and email)",
            );
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  }
}
