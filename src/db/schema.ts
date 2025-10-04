import {
    pgTable,
    varchar,
    timestamp,
    text,
    jsonb,
    integer,
    pgEnum,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -----------------------------
// ENUMS
// -----------------------------
export const roleEnum = pgEnum("role", ["BUYER", "SELLER", "ADMIN"]);
export const industryEnum = pgEnum("industry", [
    "ELECTRICITY",
    "LOGISTICS",
    "MANUFACTURING",
    "AGRICULTURE",
    "CONSTRUCTION",
    "AVIATION",
]);
export const projectCategoryEnum = pgEnum("project_category", [
    "REFORESTATION",
    "RENEWABLE_ENERGY",
    "WASTE_MANAGEMENT",
    "CARBON_CAPTURE",
    "AGRICULTURE",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
    "PENDING",
    "VERIFIED",
    "REJECTED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
    "SUCCESS",
    "FAILED",
    "PENDING",
]);

// -----------------------------
// 1️⃣ USER MODEL
// -----------------------------
export const users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: varchar("email").notNull().unique(),
    password: text("password").notNull(),
    role: roleEnum("role").notNull().default("BUYER"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------
// 2️⃣ BUYER PROFILE
// -----------------------------
export const buyerProfiles = pgTable("buyer_profiles", {
    id: varchar("id").primaryKey().notNull(),
    userId: varchar("user_id").notNull().unique(),
    companyName: text("company_name").notNull(),
    industryType: industryEnum("industry_type").notNull(),
    totalEmissions: doublePrecision("total_emissions"),
    carbonCreditsReq: doublePrecision("carbon_credits_req"),
    aiRecommendations: jsonb("ai_recommendations"),
    gstNumber: varchar("gst_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------
// 3️⃣ SELLER PROFILE
// -----------------------------
export const sellerProfiles = pgTable("seller_profiles", {
    id: varchar("id").primaryKey().notNull(),
    userId: varchar("user_id").notNull().unique(),
    organizationName: text("organization_name").notNull(),
    projectCount: integer("project_count").notNull().default(0),
    totalCredits: doublePrecision("total_credits"),
    totalRevenue: doublePrecision("total_revenue"),
    verificationDocs: text("verification_docs").array(),
    gstNumber: varchar("gst_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------
// 4️⃣ PROJECT MODEL
// -----------------------------
export const projects = pgTable("projects", {
    id: varchar("id").primaryKey().notNull(),
    sellerId: varchar("seller_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: projectCategoryEnum("category").notNull(),
    location: text("location").notNull(),
    verificationStatus: verificationStatusEnum("verification_status").notNull().default("PENDING"),
    creditsAvailable: doublePrecision("credits_available").notNull(),
    pricePerCredit: doublePrecision("price_per_credit").notNull(),
    aiPriceEstimate: doublePrecision("ai_price_estimate"),
    documents: text("documents").array(),
    registryStandard: text("registry_standard"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------
// 5️⃣ TRANSACTION MODEL
// -----------------------------
export const transactions = pgTable("transactions", {
    id: varchar("id").primaryKey().notNull(),
    buyerId: varchar("buyer_id").notNull(),
    projectId: varchar("project_id").notNull(),
    creditsPurchased: doublePrecision("credits_purchased").notNull(),
    totalAmount: doublePrecision("total_amount").notNull(),
    gstApplied: doublePrecision("gst_applied").notNull(),
    invoiceUrl: text("invoice_url"),
    transactionDate: timestamp("transaction_date").defaultNow().notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("SUCCESS"),
});

// -----------------------------
// 6️⃣ CARBON CALCULATOR DATA
// -----------------------------
export const carbonCalculatorData = pgTable("carbon_calculator_data", {
    id: varchar("id").primaryKey().notNull(),
    buyerId: varchar("buyer_id").notNull(),
    industry: industryEnum("industry").notNull(),
    inputData: jsonb("input_data").notNull(),
    estimatedCO2: doublePrecision("estimated_co2").notNull(),
    creditsNeeded: doublePrecision("credits_needed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------
// RELATIONS
// -----------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
    buyerProfile: one(buyerProfiles, {
        fields: [users.id],
        references: [buyerProfiles.userId],
    }),
    sellerProfile: one(sellerProfiles, {
        fields: [users.id],
        references: [sellerProfiles.userId],
    }),
    transactions: many(transactions),
}));

export const buyerProfilesRelations = relations(buyerProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [buyerProfiles.userId],
        references: [users.id],
    }),
    calculatorData: many(carbonCalculatorData),
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [sellerProfiles.userId],
        references: [users.id],
    }),
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    seller: one(sellerProfiles, {
        fields: [projects.sellerId],
        references: [sellerProfiles.id],
    }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    buyer: one(users, {
        fields: [transactions.buyerId],
        references: [users.id],
    }),
    project: one(projects, {
        fields: [transactions.projectId],
        references: [projects.id],
    }),
}));

export const carbonCalculatorRelations = relations(carbonCalculatorData, ({ one }) => ({
    buyer: one(buyerProfiles, {
        fields: [carbonCalculatorData.buyerId],
        references: [buyerProfiles.id],
    }),
}));