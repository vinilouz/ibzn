import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { appointments, participants, facilitators, rooms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const appointmentId = Number(params.id);

  if (isNaN(appointmentId)) {
    throw error(400, 'ID inválido');
  }

  const appointment = await db
    .select({
      id: appointments.id,
      name: appointments.name,
      email: appointments.email,
      phone: appointments.phone,
      reason: appointments.reason,
      dateTime: appointments.dateTime,
      endTime: appointments.endTime,
      isSignedUp: appointments.isSignedUp,
      facilitatorId: appointments.facilitatorId,
      roomId: appointments.roomId,
      participantId: appointments.participantId,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      facilitatorName: facilitators.name,
      roomName: rooms.name,
      participantName: participants.name
    })
    .from(appointments)
    .leftJoin(facilitators, eq(appointments.facilitatorId, facilitators.id))
    .leftJoin(rooms, eq(appointments.roomId, rooms.id))
    .leftJoin(participants, eq(appointments.participantId, participants.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment || appointment.length === 0) {
    throw error(404, 'Agendamento não encontrado');
  }

  const allFacilitators = await db.select().from(facilitators);
  const allRooms = await db.select().from(rooms);
  const allParticipants = await db.select().from(participants);

  return {
    appointment: appointment[0],
    facilitators: allFacilitators,
    rooms: allRooms,
    participants: allParticipants
  };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    try {
      const appointmentId = Number(params.id);
      const data = await request.formData();

      const name = data.get('name') as string;
      const email = data.get('email') as string | null;
      const phone = data.get('phone') as string | null;
      const reason = data.get('reason') as string | null;
      const date = data.get('date') as string;
      const startTime = data.get('startTime') as string;
      const endTime = data.get('endTime') as string | null;
      const isSignedUp = data.get('isSignedUp') === 'true';
      const facilitatorId = data.get('facilitatorId') as string | null;
      const roomId = data.get('roomId') as string | null;
      const participantId = data.get('participantId') as string | null;

      // Validação básica
      if (!date || !startTime || !name) {
        return { success: false, error: 'Campos obrigatórios faltando' };
      }

      const dateTime = new Date(`${date}T${startTime}:00`).toISOString();

      await db.update(appointments)
        .set({
          name,
          email: email || null,
          phone: phone || null,
          reason: reason || null,
          dateTime,
          endTime: endTime || null,
          isSignedUp,
          facilitatorId: facilitatorId ? Number(facilitatorId) : null,
          roomId: roomId ? Number(roomId) : null,
          participantId: participantId ? Number(participantId) : null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(appointments.id, appointmentId));

      throw redirect(303, '/calendar');
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error('Error updating appointment:', err);
      return { success: false, error: String(err) };
    }
  },

  delete: async ({ params }) => {
    try {
      const appointmentId = Number(params.id);
      await db.delete(appointments).where(eq(appointments.id, appointmentId));
      throw redirect(303, '/calendar');
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error('Error deleting appointment:', err);
      return { success: false, error: String(err) };
    }
  }
};
