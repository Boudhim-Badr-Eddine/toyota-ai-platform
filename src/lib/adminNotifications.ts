import type { Dealership, Lead, Reservation, Vehicle } from "@prisma/client";
import { adminInbox, buildAdminNotificationEmail, sendEmail } from "@/lib/email";

type LeadWithRelations = Lead & {
  vehicle: Vehicle;
  dealership?: Dealership | null;
};

type ReservationWithRelations = Reservation & {
  vehicle: Vehicle;
  lead: LeadWithRelations;
};

function configRecord(configuration: unknown): Record<string, unknown> {
  if (configuration && typeof configuration === "object" && !Array.isArray(configuration)) {
    return configuration as Record<string, unknown>;
  }
  return {};
}

function buildPayloadFromLead(
  lead: LeadWithRelations,
  extras?: {
    reservation?: Reservation;
    appointmentDate?: Date;
    reservationType?: string;
    reservationNotes?: string | null;
  }
) {
  return {
    kind: extras?.reservation ? ("reservation" as const) : ("lead" as const),
    leadType: lead.type,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    vehicleName: lead.vehicle.name,
    vehicleCategory: lead.vehicle.category,
    vehiclePrice: lead.vehicle.priceFrom,
    dealershipName: lead.dealership?.name,
    dealershipCity: lead.dealership?.city,
    dealershipPhone: lead.dealership?.phone,
    dealershipAddress: lead.dealership?.address,
    appointmentDate: extras?.appointmentDate ?? extras?.reservation?.date ?? null,
    reservationType: extras?.reservationType ?? extras?.reservation?.type ?? null,
    reservationNotes: extras?.reservationNotes ?? extras?.reservation?.notes ?? null,
    configuration: configRecord(lead.configuration),
    leadId: lead.id,
    reservationId: extras?.reservation?.id,
  };
}

/** Notify admin when a client confirms a lead (devis, SAV — no rendez-vous API call). */
export async function notifyAdminLeadConfirmed(lead: LeadWithRelations): Promise<void> {
  if (lead.type !== "quote") return;

  const { subject, html, text } = buildAdminNotificationEmail(buildPayloadFromLead(lead));
  await sendEmail({ to: adminInbox(), subject, html, text });
}

/** Notify admin when a client confirms achat / essai / rendez-vous with a scheduled slot. */
export async function notifyAdminReservationConfirmed(
  reservation: ReservationWithRelations
): Promise<void> {
  const { subject, html, text } = buildAdminNotificationEmail(
    buildPayloadFromLead(reservation.lead, {
      reservation,
      appointmentDate: reservation.date,
      reservationType: reservation.type,
      reservationNotes: reservation.notes,
    })
  );
  await sendEmail({ to: adminInbox(), subject, html, text });
}
