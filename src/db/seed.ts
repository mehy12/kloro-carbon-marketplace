// src/db/seed.ts
import "dotenv/config";
import { db } from "./index"; // ⬅️ adjust path to your db/drizzle client
import {
  user,
  project,
  carbonCredit,
  transaction,
} from "./schema"; // ⬅️ adjust path & table names
import type { InferInsertModel } from "drizzle-orm";

type NewUser = InferInsertModel<typeof user>;
type NewProject = InferInsertModel<typeof project>;
type NewCarbonCredit = InferInsertModel<typeof carbonCredit>;
type NewTransaction = InferInsertModel<typeof transaction>;

interface ErrorWithMessage {
  message?: string;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ErrorWithMessage).message ?? "Unknown error";
  }
  return "Unknown error";
}

async function clearDatabase() {
  // Order matters because of foreign keys
  await db.delete(transaction);
  await db.delete(carbonCredit);
  await db.delete(project);
  await db.delete(user);
}

async function seedUsers() {
  const demoUsers: NewUser[] = [
    {
      // adjust fields to your schema
      id: "buyer-1",
      email: "buyer@example.com",
      name: "Demo Buyer",
      role: "buyer",
    },
    {
      id: "seller-1",
      email: "seller@example.com",
      name: "Demo Seller",
      role: "seller",
    },
  ];

  await db.insert(user).values(demoUsers).onConflictDoNothing();

  console.log(`✅ Seeded ${demoUsers.length} users`);
}

async function seedProjects() {
  const demoProjects: NewProject[] = [
    {
      // adjust fields to your schema
      id: "project-1",
      name: "Mangrove Restoration Initiative",
      description: "Blue carbon project restoring coastal mangroves.",
      registry: "Verra",
      location: "India",
      sellerId: "seller-1",
      type: "reforestation",
      vintageYear: 2024,
    },
    {
      id: "project-2",
      name: "Solar Farm Expansion",
      description: "Utility-scale solar project reducing grid emissions.",
      registry: "Gold Standard",
      location: "Kenya",
      sellerId: "seller-1",
      type: "renewable_energy",
      vintageYear: 2023,
    },
  ];

  await db.insert(project).values(demoProjects).onConflictDoNothing();

  console.log(`✅ Seeded ${demoProjects.length} projects`);
}

async function seedCarbonCredits() {
  const demoCredits: NewCarbonCredit[] = [
    {
      // adjust fields to your schema
      id: "credit-1",
      projectId: "project-1",
      quantity: 1_000,
      availableQuantity: 1_000,
      pricePerCredit: "15.00", // decimal as string
      status: "available",
    },
    {
      id: "credit-2",
      projectId: "project-2",
      quantity: 500,
      availableQuantity: 500,
      pricePerCredit: "18.00",
      status: "available",
    },
  ];

  await db.insert(carbonCredit).values(demoCredits).onConflictDoNothing();

  console.log(`✅ Seeded ${demoCredits.length} carbon credits`);
}

async function seedDemoTransactions() {
  // Note: In your schema, transaction references buyerProfile.id and sellerProfile.id, not user.id
  // So you'll need to create buyer/seller profiles first, or adjust this seed data accordingly
  const demoTx: NewTransaction = {
    id: "tx-1",
    buyerId: "buyer-1", // This should be a buyerProfile.id
    sellerId: "seller-1", // This should be a sellerProfile.id
    creditId: "credit-1", // References carbonCredit.id
    quantity: 100,
    totalPrice: "1500.00", // decimal as string
    status: "completed",
    registry: "Verra",
    certificateUrl: "https://example.com/certificates/demo-1",
    blockchainTxHash: "0xDEMO_BLOCKCHAIN_TX_HASH",
    projectId: "project-1",
  };

  await db.insert(transaction).values(demoTx).onConflictDoNothing();

  console.log("✅ Seeded 1 demo transaction");
}

async function main() {
  console.log("🌱 Starting Drizzle database seed...");

  await clearDatabase();
  console.log("🧹 Cleared existing data");

  await seedUsers();
  await seedProjects();
  await seedCarbonCredits();
  await seedDemoTransactions();

  console.log("✅ Database seeding complete");
}

main().catch((error: unknown) => {
  console.error("❌ Seeding failed:", getErrorMessage(error));
  process.exit(1);
});
