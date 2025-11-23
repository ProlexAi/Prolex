/**
 * MCP Tools: Google Calendar
 */

import { z } from 'zod';
import * as calendarClient from '../../clients/calendarClient.js';
import type { MCPToolResponse } from '../../types/index.js';

export const CalendarListEventsSchema = z.object({
  calendarId: z.string().optional().default('primary').describe('ID du calendrier'),
  timeMin: z.string().optional().describe('Date min (ISO 8601)'),
  timeMax: z.string().optional().describe('Date max (ISO 8601)'),
  maxResults: z.number().optional().default(50).describe('Nombre max de résultats'),
});

export const CalendarCreateEventSchema = z.object({
  summary: z.string().describe('Titre de l\'événement'),
  description: z.string().optional().describe('Description'),
  startDateTime: z.string().describe('Date/heure début (ISO 8601)'),
  endDateTime: z.string().describe('Date/heure fin (ISO 8601)'),
  location: z.string().optional().describe('Lieu'),
  attendees: z.array(z.string()).optional().describe('Emails des participants'),
  calendarId: z.string().optional().default('primary'),
});

export const CalendarDeleteEventSchema = z.object({
  eventId: z.string().describe('ID de l\'événement'),
  calendarId: z.string().optional().default('primary'),
});

export async function calendarListEvents(args: z.infer<typeof CalendarListEventsSchema>): Promise<MCPToolResponse> {
  try {
    const events = await calendarClient.listEvents(args.calendarId, args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            eventCount: events.length,
            events: events.map((e) => ({
              id: e.id,
              summary: e.summary,
              start: e.start,
              end: e.end,
              location: e.location,
            })),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Calendar list: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function calendarCreateEvent(args: z.infer<typeof CalendarCreateEventSchema>): Promise<MCPToolResponse> {
  try {
    const eventId = await calendarClient.createEvent({
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.startDateTime },
      end: { dateTime: args.endDateTime },
      location: args.location,
      attendees: args.attendees?.map((email) => ({ email })),
    }, args.calendarId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Événement "${args.summary}" créé`,
            eventId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Calendar create: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function calendarDeleteEvent(args: z.infer<typeof CalendarDeleteEventSchema>): Promise<MCPToolResponse> {
  try {
    await calendarClient.deleteEvent(args.eventId, args.calendarId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Événement ${args.eventId} supprimé`,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Calendar delete: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
