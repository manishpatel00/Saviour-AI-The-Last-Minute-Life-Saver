/**
 * Google Workspace Integration Helpers (Google Calendar & Gmail Drafts)
 */

export interface CalendarEventResponse {
  id: string;
  htmlLink?: string;
  summary: string;
}

export interface GmailDraftResponse {
  id: string;
  message?: {
    id: string;
    threadId: string;
  };
}

/**
 * Create an event on the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  title: string,
  description: string,
  dueDateString: string,
  durationMinutes: number = 60
): Promise<CalendarEventResponse> {
  const startObj = new Date(dueDateString);
  // If date is invalid, fallback to now
  const start = isNaN(startObj.getTime()) ? new Date() : startObj;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const event = {
    summary: `🎯 Saviour Task: ${title}`,
    description: `${description}\n\nScheduled automatically via Saviour AI.`,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    reminders: {
      useDefault: true
    }
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API Error: ${errText}`);
  }

  return response.json();
}

/**
 * Base64url encode helper for Gmail raw format
 */
function base64urlEncode(str: string): string {
  // We use encodeURIComponent & unescape to handle multi-byte characters safely
  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Create an email draft in the user's Gmail account
 */
export async function createGmailDraft(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<GmailDraftResponse> {
  // Build raw MIME email message
  const mimeMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    bodyText
  ].join('\r\n');

  const raw = base64urlEncode(mimeMessage);

  const response = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/drafts',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          raw
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API Error: ${errText}`);
  }

  return response.json();
}
