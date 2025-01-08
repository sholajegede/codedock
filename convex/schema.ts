import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    notificationType: v.optional(v.string()),
    communication_updates: v.optional(v.boolean()), // true or false : default = true
    marketing_updates: v.optional(v.boolean()), // true or false
    social_updates: v.optional(v.boolean()), // true or false
    security_updates: v.optional(v.boolean()), // true or false : default = true
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  }),

  codeExecutions: defineTable({
    userId: v.id("users"),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }),

  snippets: defineTable({
    userId: v.id("users"),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.optional(v.string()), // store user's name for easy access
  }),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.id("users"),
    userName: v.optional(v.string()),
    content: v.string(), // This will store HTML content
  }),

  stars: defineTable({
    userId: v.id("users"),
    snippetId: v.id("snippets"),
  })
});