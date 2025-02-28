import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const upgradeToPro = mutation({
  args: {
    email: v.string(),
    lemonSqueezyCustomerId: v.string(),
    lemonSqueezyOrderId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isPro: true,
      proSince: Date.now(),
      lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
      lemonSqueezyOrderId: args.lemonSqueezyOrderId,
    });

    return { success: true };
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    notificationType: v.optional(v.string()),
    communication_updates: v.optional(v.boolean()), // true or false : default = true
    marketing_updates: v.optional(v.boolean()), // true or false
    social_updates: v.optional(v.boolean()), // true or false
    security_updates: v.optional(v.boolean()), // true or false : default = true
    stripeId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      const newUserId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        imageStorageId: args.imageStorageId,
        notificationType: "all",
        communication_updates: true,
        marketing_updates: false,
        social_updates: false,
        security_updates: true,
        isPro: false
      });
      const updatedUser = await ctx.db.get(newUserId);

      return updatedUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new ConvexError("Failed to create user.");
    }
  }
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    notificationType: v.optional(v.string()),
    communication_updates: v.optional(v.boolean()), // true or false : default = true
    marketing_updates: v.optional(v.boolean()), // true or false
    social_updates: v.optional(v.boolean()), // true or false
    security_updates: v.optional(v.boolean()), // true or false : default = true
    stripeId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const updateFields = {
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.imageStorageId !== undefined && { imageStorageId: args.imageStorageId }),
      ...(args.notificationType !== undefined && { notificationType: args.notificationType }),
      ...(args.communication_updates !== undefined && { communication_updates: args.communication_updates }),
      ...(args.marketing_updates !== undefined && { marketing_updates: args.marketing_updates }),
      ...(args.social_updates !== undefined && { social_updates: args.social_updates }),
      ...(args.security_updates !== undefined && { security_updates: args.security_updates }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.stripeId !== undefined && { stripeId: args.stripeId })
    };

    await ctx.db.patch(args.userId, updateFields);
    return args.userId;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const getUserByConvexId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  }
});

export const deleteAndUpdateImage = mutation({
  args: {
    userId: v.id("users"),
    oldImageStorageId: v.id('_storage'),
    newImageUrl: v.string(),
    newImageStorageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.oldImageStorageId);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const updateProfileImage = {
      ...(args.newImageUrl !== undefined && { imageUrl: args.newImageUrl }),
      ...(args.newImageStorageId !== undefined && { imageStorageId: args.newImageStorageId })
    };

    await ctx.db.patch(args.userId, updateProfileImage);
  },
});

export const saveNewProfileImage = mutation({
  args: {
    userId: v.id("users"),
    newImageUrl: v.string(),
    newImageStorageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const updateProfileImage = {
      ...(args.newImageUrl !== undefined && { imageUrl: args.newImageUrl }),
      ...(args.newImageStorageId !== undefined && { imageStorageId: args.newImageStorageId })
    };

    await ctx.db.patch(args.userId, updateProfileImage);
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    return await ctx.db.delete(args.userId);
  },
});

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const updateUserClerk = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    stripeId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const updateFields = {
      ...(args.clerkId !== undefined && { clerkId: args.clerkId }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.stripeId !== undefined && { stripeId: args.stripeId })
    };

    await ctx.db.patch(user._id, updateFields);
    return user._id;
  },
});

export const deleteUserClerk = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});