/**
 * Client Google Calendar
 */

import { google, type calendar_v3 } from 'googleapis';
import { getAuthClient } from './authClient.js';
import type { CalendarEvent, CalendarListOptions } from '../types/index.js';

let calendarClient: calendar_v3.Calendar | null = null;

export function getCalendarClient(): calendar_v3.Calendar {
  if (!calendarClient) {
    calendarClient = google.calendar({ version: 'v3' });
  }
  return calendarClient;
}

export async function listEvents(
  calendarId: string = 'primary',
  options: CalendarListOptions = {}
): Promise<CalendarEvent[]> {
  const auth = await getAuthClient();
  const calendar = getCalendarClient();

  const response = await calendar.events.list({
    auth,
    calendarId,
    timeMin: options.timeMin,
    timeMax: options.timeMax,
    maxResults: options.maxResults || 100,
    singleEvents: options.singleEvents !== false,
    orderBy: options.orderBy || 'startTime',
  });

  return response.data.items?.map((event) => ({
    id: event.id,
    summary: event.summary || '',
    description: event.description,
    start: event.start!,
    end: event.end!,
    attendees: event.attendees?.map((a) => ({
      email: a.email!,
      displayName: a.displayName,
      responseStatus: a.responseStatus as any,
    })),
    location: event.location,
    colorId: event.colorId,
    recurrence: event.recurrence,
  })) || [];
}

export async function createEvent(
  event: CalendarEvent,
  calendarId: string = 'primary'
): Promise<string> {
  const auth = await getAuthClient();
  const calendar = getCalendarClient();

  const response = await calendar.events.insert({
    auth,
    calendarId,
    requestBody: event as any,
  });

  return response.data.id!;
}

export async function updateEvent(
  eventId: string,
  event: Partial<CalendarEvent>,
  calendarId: string = 'primary'
): Promise<void> {
  const auth = await getAuthClient();
  const calendar = getCalendarClient();

  await calendar.events.patch({
    auth,
    calendarId,
    eventId,
    requestBody: event as any,
  });
}

export async function deleteEvent(
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const auth = await getAuthClient();
  const calendar = getCalendarClient();

  await calendar.events.delete({
    auth,
    calendarId,
    eventId,
  });
}
