import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { AppState } from "@/lib/store";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId");

    // Users can only access their own data
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const taxData = await prisma.taxData.findUnique({
      where: { userId },
    });

    if (!taxData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse JSON strings back to objects
    const data: Partial<AppState> = {
      hasCompletedOnboarding: taxData.hasCompletedOnboarding,
      userProfile: JSON.parse(taxData.userProfile),
      receipts: JSON.parse(taxData.receipts),
      remoteWorkingDays: JSON.parse(taxData.remoteWorkingDays),
      remoteWorkingBills: taxData.remoteWorkingBills ? JSON.parse(taxData.remoteWorkingBills) : null,
      rentTaxCredit: taxData.rentTaxCredit ? JSON.parse(taxData.rentTaxCredit) : null,
      mortgageInterestRelief: taxData.mortgageInterestRelief ? JSON.parse(taxData.mortgageInterestRelief) : null,
      smallBenefitVouchers: JSON.parse(taxData.smallBenefitVouchers),
      lifestyleCredits: JSON.parse(taxData.lifestyleCredits),
      estimatedRefund: taxData.estimatedRefund,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error loading user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { data } = body as { data: Partial<AppState> };

    // Upsert tax data
    await prisma.taxData.upsert({
      where: { userId },
      create: {
        userId,
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
        userProfile: JSON.stringify(data.userProfile ?? {}),
        receipts: JSON.stringify(data.receipts ?? []),
        remoteWorkingDays: JSON.stringify(data.remoteWorkingDays ?? []),
        remoteWorkingBills: data.remoteWorkingBills ? JSON.stringify(data.remoteWorkingBills) : null,
        rentTaxCredit: data.rentTaxCredit ? JSON.stringify(data.rentTaxCredit) : null,
        mortgageInterestRelief: data.mortgageInterestRelief ? JSON.stringify(data.mortgageInterestRelief) : null,
        smallBenefitVouchers: JSON.stringify(data.smallBenefitVouchers ?? []),
        lifestyleCredits: JSON.stringify(data.lifestyleCredits ?? []),
        estimatedRefund: data.estimatedRefund ?? 0,
      },
      update: {
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? undefined,
        userProfile: data.userProfile ? JSON.stringify(data.userProfile) : undefined,
        receipts: data.receipts ? JSON.stringify(data.receipts) : undefined,
        remoteWorkingDays: data.remoteWorkingDays ? JSON.stringify(data.remoteWorkingDays) : undefined,
        remoteWorkingBills: data.remoteWorkingBills ? JSON.stringify(data.remoteWorkingBills) : undefined,
        rentTaxCredit: data.rentTaxCredit ? JSON.stringify(data.rentTaxCredit) : undefined,
        mortgageInterestRelief: data.mortgageInterestRelief ? JSON.stringify(data.mortgageInterestRelief) : undefined,
        smallBenefitVouchers: data.smallBenefitVouchers ? JSON.stringify(data.smallBenefitVouchers) : undefined,
        lifestyleCredits: data.lifestyleCredits ? JSON.stringify(data.lifestyleCredits) : undefined,
        estimatedRefund: data.estimatedRefund ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

