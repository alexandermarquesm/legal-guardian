import { stripe, PACKAGES } from "../config/stripe";

export class PaymentController {
  static async handleCheckout(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as any;
      const { packageId, successUrl, cancelUrl } = body;

      if (!packageId || !PACKAGES[packageId as keyof typeof PACKAGES]) {
        return new Response(
          JSON.stringify({ error: "Invalid package selected" }),
          {
            status: 400,
          },
        );
      }

      const selectedPackage = PACKAGES[packageId as keyof typeof PACKAGES];

      // Create Stripe Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: selectedPackage.name,
                description: `${selectedPackage.credits} Document Analysis Credits`,
              },
              unit_amount: selectedPackage.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl || "http://localhost:3000?payment_success=true",
        cancel_url: cancelUrl || "http://localhost:3000?payment_canceled=true",
        metadata: {
          packageId,
          credits: selectedPackage.credits.toString(),
        },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Payment init failed" }),
        {
          status: 500,
        },
      );
    }
  }
}
