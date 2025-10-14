import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db";
import * as schema from "@/db/schema"

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "http://192.168.137.235:3000"],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema
        }
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "buyer",
                required: false,
            }
        }
    }

})
