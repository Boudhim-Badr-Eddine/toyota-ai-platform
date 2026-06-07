import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminInbox, buildAdminNotificationEmail, isEmailConfigured, sendEmail } from "@/lib/email";

export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local",
      },
      { status: 503 }
    );
  }

  const { subject, html, text } = buildAdminNotificationEmail({
    kind: "reservation",
    leadType: "purchase",
    firstName: "Test",
    lastName: "Admin",
    email: "client@toyota-ma.com",
    phone: "+212 612 000 000",
    vehicleName: "Toyota RAV4",
    vehicleCategory: "SUV",
    vehiclePrice: 389000,
    dealershipName: "Toyota Casablanca",
    dealershipCity: "Casablanca",
    dealershipPhone: "+212 522 000 000",
    dealershipAddress: "Bd Mohammed V",
    appointmentDate: new Date(Date.now() + 86400000),
    reservationType: "visit",
    reservationNotes: "Email test depuis l'admin",
    configuration: { color: { name: "Rouge Passion" } },
    leadId: "test-lead-id",
    reservationId: "test-reservation-id",
  });

  const sent = await sendEmail({ to: adminInbox(), subject, html, text });

  return NextResponse.json({
    ok: sent,
    to: adminInbox(),
    message: sent ? "Email de test envoyé" : "Échec d'envoi — voir les logs serveur",
  });
}
