import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "oppapost",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create or retrieve test user
  const passwordHash = await bcrypt.hash(
    "ChangeThisPassword123!",
    12
  );

  const user = await prisma.user.upsert({
    where: { email: "test@oppapost.com" },
    update: {},
    create: {
      email: "test@oppapost.com",
      name: "Oppapost Test User",
      passwordHash,
    },
  });

  console.log("Test user ready:", {
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // 2. Create or retrieve test address
  await prisma.address.upsert({
    where: { userId: user.id },
    update: {
      city: "Busan",
  stateProvince: "Busan",
  country: "South Korea",
    },
    create: {
      userId: user.id,
      recipientName: user.name,
      phone: "010-0000-0000",
      address: "123 Example-ro, Busan, South Korea",
      postalCode: "00000",
      city: "Busan",
      stateProvince: "Busan",
      country: "South Korea",
    },
  });

  console.log("Test address ready.");

  // 3. Create or retrieve test packages
  const packages = [
    {
      trackingNumber: "KR123456789",
      status: "READY_TO_SHIP" as const,
      weight: 2.5,
      receivedAt: new Date("2026-10-08"),
    },
    {
      trackingNumber: "KR987654321",
      status: "READY_TO_SHIP" as const,
      weight: 2.5,
      receivedAt: new Date("2026-10-07"),
    },
    {
      trackingNumber: "KR555555555",
      status: "INCOMING" as const,
      weight: 1.2,
      receivedAt: null,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { trackingNumber: pkg.trackingNumber },
      update: {},
      create: {
        userId: user.id,
        trackingNumber: pkg.trackingNumber,
        source: "STORE",
        status: pkg.status,
        weight: pkg.weight,
        receivedAt: pkg.receivedAt,
      },
    });
  }

  console.log("Test packages ready.");

  // 4. Create or retrieve test shipments
  const shipments = [
    {
      trackingNumber: "OPP-SHIP-001",
      method: "AIR_CARGO" as const,
      weight: 5.0,
      shippedAt: new Date("2026-10-10"),
      estimatedArrival: new Date("2026-10-16"),
      deliveredAt: null,
      status: "SHIPPING" as const,
    },
    {
      trackingNumber: "OPP-SHIP-002",
      method: "EMS" as const,
      weight: 3.2,
      shippedAt: new Date("2026-09-25"),
      estimatedArrival: null,
      deliveredAt: new Date("2026-09-28"),
      status: "DELIVERED" as const,
    },
    {
      trackingNumber: "OPP-SHIP-003",
      method: "EMS" as const,
      weight: 1.8,
      shippedAt: new Date("2026-09-09"),
      estimatedArrival: null,
      deliveredAt: new Date("2026-09-12"),
      status: "DELIVERED" as const,
    },
  ];

  for (const shipment of shipments) {
    await prisma.shipment.upsert({
      where: { trackingNumber: shipment.trackingNumber },
      update: {},
      create: {
        userId: user.id,
        ...shipment,
      },
    });
  }

  console.log("Test shipments ready.");

  // 5. Create or update Personal Shopper test requests
  const shopperRequests = [
    {
      productName: "Nike Air Max",
      productUrl: "https://www.nike.com/",
      status: "PACKAGE_INCOMING" as const,
      quotedPrice: "150000",
      serviceFee: "10000",
    },
    {
      productName: "Korean Skincare Set",
      productUrl: "https://www.oliveyoung.co.kr/",
      status: "AWAITING_PAYMENT" as const,
      quotedPrice: "85000",
      serviceFee: "10000",
    },
  ];

  for (const request of shopperRequests) {
    const existing = await prisma.personalShopperRequest.findFirst({
      where: {
        userId: user.id,
        productName: request.productName,
      },
    });

    if (existing) {
      await prisma.personalShopperRequest.update({
        where: { id: existing.id },
        data: {
          productUrl: request.productUrl,
          status: request.status,
          quotedPrice: request.quotedPrice,
          serviceFee: request.serviceFee,
        },
      });
    } else {
      await prisma.personalShopperRequest.create({
        data: {
          userId: user.id,
          ...request,
        },
      });
    }
  }

  console.log("Test Personal Shopper requests ready.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
