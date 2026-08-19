# ASRRO website screenshots

This gallery was captured from the integrated local application at 1440 × 1000
desktop, 768 × 1024 tablet, and 390 × 844 mobile viewports. Every current
public, authentication, applicant, member, executive, finance, file-management,
and administration route is represented at all three sizes. The tables below
link the desktop set; matching files use the `-tablet.png` and `-mobile.png`
suffixes.

## Theme and responsive variants

| Home — light                                                           | Home — dark                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Home in light mode](screenshots/pages/public-home-light-desktop.png) | ![Home in dark mode](screenshots/pages/public-home-dark-desktop.png) |

| Login — light                                                          | Login — dark                                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Login in light mode](screenshots/pages/auth-login-light-desktop.png) | ![Login in dark mode](screenshots/pages/auth-login-dark-desktop.png) |

| Dashboard — light                                                                  | Dashboard — dark                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Dashboard in light mode](screenshots/pages/dashboard-overview-light-desktop.png) | ![Dashboard in dark mode](screenshots/pages/dashboard-overview-dark-desktop.png) |

| Home — mobile                                                  | Login — mobile                                                 | Dashboard — mobile                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Mobile home](screenshots/pages/public-home-light-mobile.png) | ![Mobile login](screenshots/pages/auth-login-light-mobile.png) | ![Mobile dashboard](screenshots/pages/dashboard-overview-light-mobile.png) |

## Public routes

| Route                                         | Screenshot                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/`                                           | ![Home](screenshots/pages/public-home-light-desktop.png)                                        |
| `/about`                                      | ![About](screenshots/pages/public-about-light-desktop.png)                                      |
| `/alumni`                                     | ![Alumni](screenshots/pages/public-alumni-light-desktop.png)                                    |
| `/committee`                                  | ![Committee](screenshots/pages/public-committee-light-desktop.png)                              |
| `/contact`                                    | ![Contact](screenshots/pages/public-contact-light-desktop.png)                                  |
| `/gallery`                                    | ![Gallery](screenshots/pages/public-gallery-light-desktop.png)                                  |
| `/gallery/riverwatch-field-tests`             | ![RiverWatch gallery album](screenshots/pages/gallery-riverwatch-field-tests-light-desktop.png) |
| `/membership`                                 | ![Membership application](screenshots/pages/public-membership-light-desktop.png)                |
| `/membership/status`                          | ![Public application tracking](screenshots/pages/public-membership-status-light-desktop.png)    |
| `/membership/verify/AR-901`                   | ![Membership verification](screenshots/pages/public-membership-verification-light-desktop.png)  |
| `/publications`                               | ![Publications](screenshots/pages/public-publications-light-desktop.png)                        |
| `/search`                                     | ![Global search](screenshots/pages/public-search-light-desktop.png)                             |
| `/projects`                                   | ![Projects](screenshots/pages/public-projects-light-desktop.png)                                |
| `/projects/riverwatch-rover`                  | ![RiverWatch Rover](screenshots/pages/project-riverwatch-rover-light-desktop.png)               |
| `/events`                                     | ![Events](screenshots/pages/public-events-light-desktop.png)                                    |
| `/events/robotics-foundations-workshop-2026`  | ![Robotics workshop](screenshots/pages/event-robotics-foundations-light-desktop.png)            |
| `/events/chattogram-space-tech-bootcamp-2026` | ![Space-tech bootcamp](screenshots/pages/event-space-tech-bootcamp-light-desktop.png)           |
| `/events/bangladesh-rover-challenge-2026`     | ![Rover challenge](screenshots/pages/event-bangladesh-rover-challenge-light-desktop.png)        |
| `/news`                                       | ![News](screenshots/pages/public-news-light-desktop.png)                                        |
| `/news/riverwatch-field-notes`                | ![RiverWatch field notes](screenshots/pages/news-riverwatch-field-notes-light-desktop.png)      |
| `/login`                                      | ![Login](screenshots/pages/auth-login-light-desktop.png)                                        |
| `/forgot-password`                            | ![Forgot password](screenshots/pages/auth-forgot-password-light-desktop.png)                    |
| `/reset-password?error=INVALID_TOKEN`         | ![Invalid reset link](screenshots/pages/auth-reset-password-invalid-light-desktop.png)          |
| Unknown route                                 | ![Not found](screenshots/pages/not-found-light-desktop.png)                                     |

## Applicant and dashboard routes

| Route                         | Access               | Screenshot                                                                               |
| ----------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `/applicant-status`           | Pending applicant    | ![Applicant status](screenshots/pages/applicant-status-light-desktop.png)                |
| `/dashboard`                  | Member               | ![Overview](screenshots/pages/dashboard-overview-light-desktop.png)                      |
| `/dashboard/profile`          | Member               | ![Profile](screenshots/pages/dashboard-profile-light-desktop.png)                        |
| `/dashboard/membership`       | Member               | ![Membership card and receipt](screenshots/pages/dashboard-membership-light-desktop.png) |
| `/dashboard/events`           | Member               | ![Member events](screenshots/pages/dashboard-events-light-desktop.png)                   |
| `/dashboard/notifications`    | Member               | ![Notifications](screenshots/pages/dashboard-notifications-light-desktop.png)            |
| `/dashboard/members`          | Executive            | ![Member review and roles](screenshots/pages/dashboard-members-light-desktop.png)        |
| `/dashboard/event-management` | Executive            | ![Event operations](screenshots/pages/dashboard-event-management-light-desktop.png)      |
| `/dashboard/committee`        | Executive            | ![Committee management](screenshots/pages/dashboard-committee-light-desktop.png)         |
| `/dashboard/finance`          | Authorized executive | ![Finance](screenshots/pages/dashboard-finance-light-desktop.png)                        |
| `/dashboard/projects`         | Executive            | ![Project management](screenshots/pages/dashboard-projects-light-desktop.png)            |
| `/dashboard/content`          | Executive            | ![Content management](screenshots/pages/dashboard-content-light-desktop.png)             |
| `/dashboard/reports`          | Executive            | ![Reports](screenshots/pages/dashboard-reports-light-desktop.png)                        |
| `/dashboard/settings`         | Super administrator  | ![Settings](screenshots/pages/dashboard-settings-light-desktop.png)                      |
| `/dashboard/files`            | Authorized executive | ![File manager](screenshots/pages/dashboard-files-light-desktop.png)                     |

## Reproduce the gallery

With the development server running, execute:

```bash
./scripts/capture-screenshots.sh
```

Set `ASRRO_SCREENSHOT_EMAIL` and `ASRRO_SCREENSHOT_PASSWORD` to include authenticated dashboard routes. Set `ASRRO_SCREENSHOT_PENDING_EMAIL` and `ASRRO_SCREENSHOT_PENDING_PASSWORD` to include the applicant status route. Credentials are read from the environment and are not stored by the capture script.
