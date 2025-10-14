import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum, decimal, jsonb, integer } from "drizzle-orm/pg-core";

// -- ENUMS --
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const creditStatusEnum = pgEnum('credit_status', ['available', 'sold', 'retired']);
export const projectTypeEnum = pgEnum('project_type', ['reforestation', 'renewable_energy', 'waste_management', 'methane_capture']);

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: userRoleEnum('role').notNull().default('buyer'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// -- NEW ROLE-BASED & APPLICATION-SPECIFIC TABLES --

export const buyerProfile = pgTable("buyer_profile", {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    industry: text('industry'),
    address: jsonb('address'),
    verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
    verifiedBy: text('verified_by').references(() => user.id),
    // Carbon calculation fields
    employeeCount: integer('employee_count'),
    annualRevenue: decimal('annual_revenue', { precision: 15, scale: 2 }),
    energyConsumption: decimal('energy_consumption', { precision: 10, scale: 2 }), // kWh per year
    businessTravelDistance: decimal('business_travel_distance', { precision: 10, scale: 2 }), // km per year
    calculatedCarbonFootprint: decimal('calculated_carbon_footprint', { precision: 10, scale: 2 }), // tCO2e per year
    recommendedCredits: integer('recommended_credits'), // credits needed per year
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sellerProfile = pgTable("seller_profile", {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
    organizationName: text('organization_name').notNull(),
    website: text('website'),
    verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
    verifiedBy: text('verified_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const project = pgTable("project", {
    id: text('id').primaryKey(),
    sellerId: text('seller_id').notNull().references(() => sellerProfile.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    type: projectTypeEnum('type').notNull(),
    location: text('location'),
    registry: text('registry'),
    vintageYear: integer('vintage_year'),
    verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
    verifiedBy: text('verified_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const wasteLedger = pgTable("waste_ledger", {
    id: text('id').primaryKey(),
    buyerId: text('buyer_id').notNull().references(() => buyerProfile.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    co2eAmount: decimal('co2e_amount', { precision: 10, scale: 2 }).notNull(),
    recordedDate: timestamp('recorded_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const carbonCredit = pgTable("carbon_credit", {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    availableQuantity: integer('available_quantity').notNull(),
    pricePerCredit: decimal('price_per_credit', { precision: 10, scale: 2 }).notNull(),
    status: creditStatusEnum('status').default('available').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transaction = pgTable("transaction", {
    id: text('id').primaryKey(),
    buyerId: text('buyer_id').notNull().references(() => buyerProfile.id, { onDelete: 'no action' }),
    sellerId: text('seller_id').notNull().references(() => sellerProfile.id, { onDelete: 'no action' }),
    creditId: text('credit_id').notNull().references(() => carbonCredit.id, { onDelete: 'no action' }),
    quantity: integer('quantity').notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    status: transactionStatusEnum('status').default('pending').notNull(),
    transactionDate: timestamp('transaction_date').defaultNow().notNull(),
    // Blockchain integration fields
    blockchainTxHash: text('blockchain_tx_hash'), // Polygon transaction hash
    registry: text('registry'), // e.g., "Verra", "Gold Standard"
    certificateUrl: text('certificate_url'), // URL to generated certificate
    projectId: text('project_id_string'), // String version for blockchain (different from FK)
});

export const certificateRecord = pgTable("certificate_record", {
    id: text("id").primaryKey(), // UUID
    certId: text("cert_id").unique().notNull(),
    transactionId: text("transaction_id").references(() => transaction.id).notNull(),
    issuedToBuyerId: text("issued_to_buyer_id").references(() => buyerProfile.id),
    issuedToSellerId: text("issued_to_seller_id").references(() => sellerProfile.id),
    verificationUrl: text("verification_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- RELATIONS --
export const userRelations = relations(user, ({ one }) => ({
    buyerProfile: one(buyerProfile, { fields: [user.id], references: [buyerProfile.userId] }),
    sellerProfile: one(sellerProfile, { fields: [user.id], references: [sellerProfile.userId] }),
}));

export const buyerProfileRelations = relations(buyerProfile, ({ one, many }) => ({
    user: one(user, { fields: [buyerProfile.userId], references: [user.id] }),
    wasteLedgers: many(wasteLedger),
    transactions: many(transaction),
}));

export const sellerProfileRelations = relations(sellerProfile, ({ one, many }) => ({
    user: one(user, { fields: [sellerProfile.userId], references: [user.id] }),
    projects: many(project),
    transactions: many(transaction),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
    seller: one(sellerProfile, { fields: [project.sellerId], references: [sellerProfile.id] }),
    credits: many(carbonCredit),
}));

export const wasteLedgerRelations = relations(wasteLedger, ({ one }) => ({
    buyer: one(buyerProfile, { fields: [wasteLedger.buyerId], references: [buyerProfile.id] }),
}));

export const carbonCreditRelations = relations(carbonCredit, ({ one, many }) => ({
    project: one(project, { fields: [carbonCredit.projectId], references: [project.id] }),
    transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
    buyer: one(buyerProfile, { fields: [transaction.buyerId], references: [buyerProfile.id] }),
    seller: one(sellerProfile, { fields: [transaction.sellerId], references: [sellerProfile.id] }),
    credit: one(carbonCredit, { fields: [transaction.creditId], references: [carbonCredit.id] }),
}));

export const certificateRecordRelations = relations(certificateRecord, ({ one }) => ({
    txn: one(transaction, { fields: [certificateRecord.transactionId], references: [transaction.id] }),
    buyer: one(buyerProfile, { fields: [certificateRecord.issuedToBuyerId], references: [buyerProfile.id] }),
    seller: one(sellerProfile, { fields: [certificateRecord.issuedToSellerId], references: [sellerProfile.id] }),
}));
