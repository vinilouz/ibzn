import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { appointments, participants, facilitators, rooms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
  const allAppointments = await db
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
    .orderBy(appointments.dateTime);

  const allFacilitators = await db.select().from(facilitators);
  const allRooms = await db.select().from(rooms);
  const allParticipants = await db.select().from(participants);

  return {
    appointments: allAppointments,
    facilitators: allFacilitators,
    rooms: allRooms,
    participants: allParticipants
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    try {
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

      console.log('Creating appointment with data:', { name, date, startTime, isSignedUp, facilitatorId, roomId, participantId });

      // Validação básica
      if (!date || !startTime || !name) {
        console.error('Missing required fields:', { date, startTime, name });
        return { success: false, error: 'Campos obrigatórios faltando' };
      }

      // Combina data e hora para criar o timestamp com timezone
      const dateTime = new Date(`${date}T${startTime}:00`).toISOString();

      await db.insert(appointments).values({
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('Appointment created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error: String(error) };
    }
  },

  delete: async ({ request }) => {
    try {
      const data = await request.formData();
      const id = Number(data.get('id'));

      await db.delete(appointments).where(eq(appointments.id, id));

      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: String(error) };
    }
  }
};
