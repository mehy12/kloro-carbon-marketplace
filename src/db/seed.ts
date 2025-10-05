import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './index';
import {
  user,
  buyerProfile,
  sellerProfile,
  project,
  carbonCredit,
  wasteLedger,
  transaction,
} from './schema';

async function main() {
  console.log('Seeding database...');

  // Clear existing data (order matters due to FKs)
  await db.execute(sql`delete from "transaction"`);
  await db.execute(sql`delete from "waste_ledger"`);
  await db.execute(sql`delete from "carbon_credit"`);
  await db.execute(sql`delete from "project"`);
  await db.execute(sql`delete from "seller_profile"`);
  await db.execute(sql`delete from "buyer_profile"`);
  await db.execute(sql`delete from "account"`);
  await db.execute(sql`delete from "session"`);
  await db.execute(sql`delete from "verification"`);
  await db.execute(sql`delete from "user"`);

  // ---------- USERS ----------
  const users = [
    { id: 'u1', name: 'Amit Sharma', email: 'amit@greenbuyers.com', role: 'buyer' },
    { id: 'u2', name: 'Neha Singh', email: 'neha@ecocorp.com', role: 'buyer' },
    { id: 'u3', name: 'Rajesh Kumar', email: 'rajesh@windindia.org', role: 'seller' },
    { id: 'u4', name: 'Priya Patel', email: 'priya@solarhub.in', role: 'seller' },
    { id: 'u5', name: 'Vikram Desai', email: 'vikram@bioenergy.in', role: 'seller' },
    { id: 'u6', name: 'Karan Mehta', email: 'karan@plasticlean.com', role: 'buyer' },
    { id: 'u7', name: 'Reema Joshi', email: 'reema@carbonoffset.org', role: 'seller' },
  ];
  await db.insert(user).values(users as any);

  // ---------- BUYER PROFILES ----------
  const buyerProfilesData = [
    {
      id: 'b1', userId: 'u1', companyName: 'Green Buyers Pvt Ltd', industry: 'Manufacturing',
      address: { city: 'Delhi', country: 'India' }, verificationStatus: 'verified'
    },
    {
      id: 'b2', userId: 'u2', companyName: 'EcoCorp Limited', industry: 'Construction',
      address: { city: 'Mumbai', country: 'India' }, verificationStatus: 'verified'
    },
    {
      id: 'b3', userId: 'u6', companyName: 'PlasticLean Pvt Ltd', industry: 'Recycling',
      address: { city: 'Bangalore', country: 'India' }, verificationStatus: 'pending'
    },
  ];
  await db.insert(buyerProfile).values(buyerProfilesData as any);

  // ---------- SELLER PROFILES ----------
  const sellerProfilesData = [
    { id: 's1', userId: 'u3', organizationName: 'Wind India Foundation', website: 'https://windindia.org', verificationStatus: 'verified' },
    { id: 's2', userId: 'u4', organizationName: 'SolarHub Renewables', website: 'https://solarhub.in', verificationStatus: 'verified' },
    { id: 's3', userId: 'u5', organizationName: 'BioEnergy Solutions', website: 'https://bioenergy.in', verificationStatus: 'pending' },
    { id: 's4', userId: 'u7', organizationName: 'CarbonOffset Org', website: 'https://carbonoffset.org', verificationStatus: 'verified' },
  ];
  await db.insert(sellerProfile).values(sellerProfilesData as any);

  // ---------- PROJECTS ----------
  const projectsData = [
    { id: 'p1', sellerId: 's1', name: 'Tamil Nadu Wind Farm', description: '50MW wind farm reducing grid emissions.', type: 'renewable_energy', location: 'Tamil Nadu', registry: 'Verra', vintageYear: 2023, verificationStatus: 'verified' },
    { id: 'p2', sellerId: 's2', name: 'Solar Rooftop Gujarat', description: 'Solar energy generation from 100+ rooftops.', type: 'renewable_energy', location: 'Gujarat', registry: 'Gold Standard', vintageYear: 2024, verificationStatus: 'verified' },
    { id: 'p3', sellerId: 's3', name: 'Biogas from Agricultural Waste', description: 'Methane capture project converting waste to biogas.', type: 'methane_capture', location: 'Punjab', registry: 'Verra', vintageYear: 2023, verificationStatus: 'pending' },
    { id: 'p4', sellerId: 's4', name: 'Reforestation - Madhya Pradesh', description: 'Replanting 2,000 hectares of degraded forest.', type: 'reforestation', location: 'Madhya Pradesh', registry: 'Gold Standard', vintageYear: 2022, verificationStatus: 'verified' },
  ];
  await db.insert(project).values(projectsData as any);

  // ---------- CARBON CREDITS ----------
  const carbonCreditsData = [
    { id: 'cc1', projectId: 'p1', quantity: 10000, availableQuantity: 8500, pricePerCredit: '9.50', status: 'available' },
    { id: 'cc2', projectId: 'p2', quantity: 8000, availableQuantity: 7000, pricePerCredit: '10.00', status: 'available' },
    { id: 'cc3', projectId: 'p3', quantity: 12000, availableQuantity: 12000, pricePerCredit: '7.25', status: 'available' },
    { id: 'cc4', projectId: 'p4', quantity: 20000, availableQuantity: 18500, pricePerCredit: '11.75', status: 'available' },
    { id: 'cc5', projectId: 'p2', quantity: 5000, availableQuantity: 4000, pricePerCredit: '10.50', status: 'available' },
  ];
  await db.insert(carbonCredit).values(carbonCreditsData as any);

  // ---------- WASTE LEDGER ----------
  const wasteLedgersData = [
    { id: 'w1', buyerId: 'b1', description: 'Monthly manufacturing emissions (Jan)', co2eAmount: '450.50' },
    { id: 'w2', buyerId: 'b1', description: 'Monthly manufacturing emissions (Feb)', co2eAmount: '470.00' },
    { id: 'w3', buyerId: 'b2', description: 'Construction site diesel use', co2eAmount: '1200.00' },
    { id: 'w4', buyerId: 'b3', description: 'Plastic recycling process waste', co2eAmount: '350.00' },
  ];
  await db.insert(wasteLedger).values(wasteLedgersData as any);

  // ---------- TRANSACTIONS ----------
  const transactionsData = [
    { id: 't1', buyerId: 'b1', sellerId: 's1', creditId: 'cc1', quantity: 1000, totalPrice: '9500.00', status: 'completed' },
    { id: 't2', buyerId: 'b2', sellerId: 's2', creditId: 'cc2', quantity: 500, totalPrice: '5000.00', status: 'completed' },
    { id: 't3', buyerId: 'b3', sellerId: 's4', creditId: 'cc4', quantity: 250, totalPrice: '2937.50', status: 'pending' },
    { id: 't4', buyerId: 'b1', sellerId: 's2', creditId: 'cc5', quantity: 400, totalPrice: '4200.00', status: 'completed' },
  ];
  await db.insert(transaction).values(transactionsData as any);

  console.log('Seed completed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).then(() => process.exit(0));
