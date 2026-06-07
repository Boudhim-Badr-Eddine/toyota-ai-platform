import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildQuotePdf } from "@/lib/quotePdf";

const QuoteSchema = z.object({
  vehicleName: z.string().min(1),
  trimName: z.string().optional(),
  color: z.string().optional(),
  wheels: z.string().optional(),
  interior: z.string().optional(),
  dealership: z.string().optional(),
  basePrice: z.number().min(0),
  options: z
    .array(z.object({ label: z.string(), amount: z.number() }))
    .default([]),
  totalPrice: z.number().min(0),
  downPayment: z.number().min(0).default(0),
  termMonths: z.number().int().min(12).max(84).default(48),
  annualRate: z.number().min(0).max(20).default(5.9),
  customerName: z.string().optional(),
});

function computeMonthly(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return Math.round(principal / months);
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, months);
  return Math.round((principal * r * factor) / (factor - 1));
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = QuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const principal = Math.max(0, data.totalPrice - data.downPayment);
    const monthlyPayment = computeMonthly(principal, data.annualRate, data.termMonths);

    const pdf = buildQuotePdf({
      ...data,
      monthlyPayment,
    });

    const filename = `devis-toyota-${data.vehicleName.toLowerCase().replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[POST /api/quote]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
