import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing. Payment features will fail.");
}

// @ts-ignore
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
      typescript: true,
    })
  : (new Proxy(
      {},
      {
        get: () => () => {
          throw new Error(
            "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
          );
        },
      },
    ) as any as Stripe);

export const PACKAGES = {
  starter: {
    priceId: "price_1Qd...",
    credits: 1,
    amount: 4900,
    name: "Starter Pack (1 Credit)",
  },
  professional: {
    priceId: "price_1Qd...",
    credits: 5,
    amount: 19500,
    name: "Professional Pack (5 Credits)",
  },
  power: {
    priceId: "price_1Qd...",
    credits: 10,
    amount: 29000,
    name: "Power User Pack (10 Credits)",
  },
};
