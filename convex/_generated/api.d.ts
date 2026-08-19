/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _lib_auth from "../_lib/auth.js";
import type * as _lib_counters from "../_lib/counters.js";
import type * as _lib_email from "../_lib/email.js";
import type * as _lib_emailDesign from "../_lib/emailDesign.js";
import type * as _lib_emailPreviews from "../_lib/emailPreviews.js";
import type * as _lib_passwordResetEmail from "../_lib/passwordResetEmail.js";
import type * as _lib_uuid from "../_lib/uuid.js";
import type * as _lib_validation from "../_lib/validation.js";
import type * as adminAccounts from "../adminAccounts.js";
import type * as alumni from "../alumni.js";
import type * as assets from "../assets.js";
import type * as blogs from "../blogs.js";
import type * as committee from "../committee.js";
import type * as contact from "../contact.js";
import type * as content from "../content.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as emails from "../emails.js";
import type * as events from "../events.js";
import type * as finance from "../finance.js";
import type * as financeBudgets from "../financeBudgets.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as members from "../members.js";
import type * as membership from "../membership.js";
import type * as model from "../model.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as publications from "../publications.js";
import type * as reports from "../reports.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_lib/auth": typeof _lib_auth;
  "_lib/counters": typeof _lib_counters;
  "_lib/email": typeof _lib_email;
  "_lib/emailDesign": typeof _lib_emailDesign;
  "_lib/emailPreviews": typeof _lib_emailPreviews;
  "_lib/passwordResetEmail": typeof _lib_passwordResetEmail;
  "_lib/uuid": typeof _lib_uuid;
  "_lib/validation": typeof _lib_validation;
  adminAccounts: typeof adminAccounts;
  alumni: typeof alumni;
  assets: typeof assets;
  blogs: typeof blogs;
  committee: typeof committee;
  contact: typeof contact;
  content: typeof content;
  crons: typeof crons;
  emailActions: typeof emailActions;
  emails: typeof emails;
  events: typeof events;
  finance: typeof finance;
  financeBudgets: typeof financeBudgets;
  gallery: typeof gallery;
  http: typeof http;
  members: typeof members;
  membership: typeof membership;
  model: typeof model;
  notifications: typeof notifications;
  projects: typeof projects;
  publications: typeof publications;
  reports: typeof reports;
  search: typeof search;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
