import { pgTable, uuid, timestamp, integer, text, index } from 'drizzle-orm/pg-core';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    durationMs: integer('duration_ms'),
    status: text('status').notNull().default('active'),
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    userAgent: text('user_agent'),
  },
  (t) => [index('sessions_started_at_idx').on(t.startedAt.desc())],
);

export const transcripts = pgTable(
  'transcripts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    turnIndex: integer('turn_index').notNull(),
    role: text('role').notNull(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('transcripts_session_created_idx').on(t.sessionId, t.createdAt)],
);
