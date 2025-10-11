import { sql } from "drizzle-orm";
import { pgTable, text, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const courses = pgTable("courses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull().unique(),
});

export const enrollments = pgTable("enrollments", {
    userId: varchar("user_id").notNull().references(() => users.id),
    courseId: varchar("course_id").notNull().references(() => courses.id),
}, (table) => {
    return {
        pk: primaryKey(table.userId, table.courseId),
    }
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCourseSchema = createInsertSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);


export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
