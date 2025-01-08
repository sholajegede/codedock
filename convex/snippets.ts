import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) throw new Error("User not found");

    const snippetId = await ctx.db.insert("snippets", {
      userId: args.userId,
      userName: (
        ((user.firstName as string) + user.lastName) as string
      ).toLowerCase(),
      title: args.title,
      language: args.language,
      code: args.code,
    });

    return snippetId;
  },
});

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    if (snippet.userId !== identity.subject) {
      throw new Error("Not authorized to delete this snippet");
    }

    const comments = await ctx.db
      .query("snippetComments")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const stars = await ctx.db
      .query("stars")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    await ctx.db.delete(args.snippetId);
  },
});

export const starSnippet = mutation({
  args: {
    userId: v.id("users"),
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stars")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("stars", {
        userId: args.userId,
        snippetId: args.snippetId,
      });
    }
  },
});

export const addComment = mutation({
  args: {
    userId: v.id("users"),
    snippetId: v.id("snippets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("snippetComments", {
      snippetId: args.snippetId,
      userId: args.userId,
      userName: (
        ((user.firstName as string) + user.lastName) as string
      ).toLowerCase(),
      content: args.content,
    });
  },
});

export const deleteComment = mutation({
  args: {
    userId: v.id("users"),
    commentId: v.id("snippetComments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if the user is the comment author
    if (comment.userId !== args.userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    const snippets = await ctx.db.query("snippets").order("desc").collect();
    return snippets;
  },
});

export const getSnippetById = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    return snippet;
  },
});

export const getComments = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("snippetComments")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .order("desc")
      .collect();

    return comments;
  },
});

export const isSnippetStarred = query({
  args: {
    userId: v.id("users"),
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const star = await ctx.db
      .query("stars")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .first();

    return !!star;
  },
});

export const getSnippetStarCount = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const stars = await ctx.db
      .query("stars")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    return stars.length;
  },
});

export const getStarredSnippets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const stars = await ctx.db
      .query("stars")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const snippets = await Promise.all(
      stars.map((star) => ctx.db.get(star.snippetId))
    );

    return snippets.filter((snippet) => snippet !== null);
  },
});