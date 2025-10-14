# 🌱 Kloro - AI-Driven Carbon Tracking & Offset Marketplace

Kloro is a comprehensive carbon credit marketplace that combines AI-powered carbon footprint analysis with blockchain-verified transactions. The platform enables companies to track their carbon emissions through sustainability report uploads and purchase verified carbon credits to offset their environmental impact.

## ✨ Features

### 🤖 AI-Powered Carbon Analysis
- **Smart Report Processing**: Upload sustainability reports (GRI, SASB, CDP, ESG) for automatic carbon footprint calculation
- **Industry Benchmarking**: Compare your emissions against industry averages
- **Intelligent Recommendations**: AI-suggested reduction opportunities and credit purchasing strategies

### 🛒 Carbon Credit Marketplace
- **Verified Credits**: Browse credits from Gold Standard, Verra, and other certified registries
- **Real-time Market Data**: Live pricing and availability updates
- **Smart Matching**: AI recommendations based on your industry and requirements

### 🔗 Blockchain Integration
- **Immutable Records**: All transactions recorded on Polygon blockchain
- **Certificate Verification**: Blockchain-verified certificates with QR codes
- **Transparent Auditing**: Public verification of all carbon credit transactions

### 📊 Comprehensive Dashboards
- **Buyer Dashboard**: Carbon footprint breakdown, credit portfolio, transaction history
- **Seller Dashboard**: Project management, credit listings, revenue tracking
- **Real-time Updates**: Live transaction monitoring and status updates

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React + TypeScript + Tailwind CSS
- **Components**: shadcn/ui component library
- **Authentication**: better-auth with OAuth (Google, GitHub)

### Backend
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **APIs**: Next.js API routes
- **Authentication**: JWT-based sessions
- **File Processing**: AI-powered document analysis

### Blockchain
- **Network**: Polygon Mumbai Testnet
- **Smart Contracts**: Solidity ^0.8.20
- **Interaction**: Ethers.js v6
- **Features**: Transaction recording, verification, certificate generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Polygon testnet wallet with MATIC

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kloro-carbon-marketplace.git
   cd kloro-carbon-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host/database"

   # Authentication
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Blockchain (for production features)
   RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/your-key"
   PRIVATE_KEY="your-wallet-private-key"
   CONTRACT_ADDRESS="deployed-contract-address"

   # AI (optional)
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Seed Sample Data** (optional)
   ```bash
   npx tsx src/db/seed.ts
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Key Features Implemented

✅ **User Authentication** - OAuth (Google, GitHub) + email/password  
✅ **Role-based Onboarding** - Buyer vs Seller workflows  
✅ **Carbon Footprint Analysis** - Upload sustainability reports  
✅ **Real-time Marketplace** - Browse and purchase carbon credits  
✅ **Transaction Management** - Real-time updates and filtering  
✅ **Certificate Generation** - Professional PDF certificates  
✅ **Blockchain Integration** - Smart contract for immutable records  
✅ **Responsive Dashboards** - Buyer and seller interfaces  

## 🔐 Authentication Flow

1. **User Registration**: Email/password or OAuth (Google, GitHub)
2. **Role Selection**: Choose between Buyer (track & offset) or Seller (sell credits)
3. **Onboarding**: 
   - **Buyers**: Upload sustainability reports for carbon footprint analysis
   - **Sellers**: Provide organization details and create first project

## 💳 Transaction Flow

### For Buyers:
1. **Analysis**: Upload sustainability reports
2. **Marketplace**: Browse available carbon credits
3. **Purchase**: Select and buy credits
4. **Verification**: Receive blockchain-verified certificate
5. **Portfolio**: Track owned and retired credits

### For Sellers:
1. **Projects**: Create carbon credit projects
2. **Listing**: List credits with pricing
3. **Sales**: Manage orders and transactions
4. **Revenue**: Track earnings and performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for a sustainable future 🌍
