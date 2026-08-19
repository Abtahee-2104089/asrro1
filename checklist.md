# ASRRO Web Portal — SRS Checklist

Source: [`docs/SRS.docx`](docs/SRS.docx), version 1.0.

This checklist converts the complete SRS into independently verifiable acceptance items. Status was audited against the repository on 3 August 2026.

**Current snapshot:** 418 of 418 items checked; the implementation,
authorization, export, responsive, capacity, and operational evidence is linked
from [`docs/traceability.md`](docs/traceability.md) and
[`docs/verification.md`](docs/verification.md).

- `[x]` — implemented with a usable repository code path.
- `[ ]` — missing, only partially wired, externally dependent, or not supported by reproducible acceptance evidence yet.

The status is intentionally conservative: a schema field, placeholder, or responsive CSS rule alone does not count as a completed user workflow.

## 1. Introduction and project scope

### 1.1 Organization and domain coverage

- [x] Represent ASRRO as a frontier technology research organization based at Chittagong University of Engineering & Technology (CUET), Bangladesh.
- [x] Support ASRRO work in space science.
- [x] Support ASRRO work in robotics.
- [x] Support ASRRO work in artificial intelligence.
- [x] Support ASRRO work in electronics.
- [x] Support ASRRO work in IoT.
- [x] Support ASRRO research and publications.
- [x] Support ASRRO engineering competitions.
- [x] Support ASRRO workshops.
- [x] Support ASRRO national-level events.

### 1.2 Platform responsibilities

- [x] Provide the official organizational website.
- [x] Provide a membership management system.
- [x] Provide an event management platform.
- [x] Provide an executive committee management portal.
- [x] Provide a finance management portal.
- [x] Provide an alumni showcase.
- [x] Provide a project portfolio.
- [x] Provide an internal administration dashboard.
- [x] Scale to thousands of members and multiple national events.

## 2. Objectives

- [x] Represent ASRRO professionally.
- [x] Increase ASRRO's public visibility.
- [x] Digitize club membership.
- [x] Automate event registration.
- [x] Manage club members.
- [x] Manage executive committee operations.
- [x] Store club history.
- [x] Showcase projects.
- [x] Showcase alumni.
- [x] Generate downloadable reports.
- [x] Reduce manual paperwork.

## 3. Users, roles, and permissions

### 3.1 Guest

- [x] Allow guests to visit the public website.
- [x] Allow guests to view projects.
- [x] Allow guests to view events.
- [x] Allow guests to view the gallery.
- [x] Allow guests to view alumni.
- [x] Allow guests to read blogs and news.
- [x] Allow guests to contact the organization.
- [x] Allow guests to apply for membership.
- [x] Allow guests to register for public events.
- [x] Prevent guests from viewing the dashboard.
- [x] Prevent guests from editing a member profile.
- [x] Prevent guests from accessing member-only pages.

### 3.2 Pending member

- [x] Allow pending members to log in.
- [x] Allow pending members to view their application status.
- [x] Prevent pending members from downloading a membership card.
- [x] Prevent pending members from registering for members-only events.
- [x] Prevent pending members from accessing the member dashboard.

### 3.3 General member

- [x] Allow general members to log in.
- [x] Allow general members to view the member dashboard.
- [x] Allow general members to update only permitted profile information.
- [x] Allow general members to view attended events.
- [x] Allow general members to register for eligible events.
- [x] Allow general members to download their membership card.
- [x] Allow general members to download their payment receipt.
- [x] Allow general members to view notifications.
- [x] Prevent general members from managing other members.
- [x] Prevent general members from editing events.
- [x] Prevent general members from accessing finance data.

### 3.4 Executive committee member

- [x] Give executive committee members all general-member permissions.
- [x] Make executive management capabilities depend on assigned role and permission.
- [x] Support the President role.
- [x] Support the Vice President role.
- [x] Support the General Secretary role.
- [x] Support the Joint General Secretary role.
- [x] Support the Organizing Secretary role.
- [x] Support the Financial Secretary role.
- [x] Support the Public Relations Secretary role.
- [x] Support the Research & Publication Secretary role.
- [x] Support the Technical Secretary role.
- [x] Support Executive Member roles.

### 3.5 Super admin

- [x] Give super admins full system control.
- [x] Allow super admins to manage every module.
- [x] Allow super admins to create executive accounts.
- [x] Allow super admins to reset passwords.
- [x] Allow super admins to configure the website.
- [x] Allow super admins to assign permissions.

## 4. Public website

### 4.1 Home

- [x] Display a hero banner.
- [x] Display an introduction.
- [x] Display an About ASRRO summary.
- [x] Display the mission.
- [x] Display the vision.
- [x] Display current highlights.
- [x] Display upcoming events.
- [x] Display featured projects.
- [x] Display organizational statistics.
- [x] Include a member-count statistic.
- [x] Include a project-count statistic.
- [x] Include an event-count statistic.
- [x] Include an alumni-count statistic.
- [x] Include a research-paper-count statistic.

### 4.2 About

- [x] Present ASRRO's history.
- [x] Present ASRRO's mission.
- [x] Present ASRRO's vision.
- [x] Present ASRRO's core values.
- [x] Present a journey timeline.

### 4.3 Executive committee

- [x] Show the current committee.
- [x] Show each committee member's position.
- [x] Show each committee member's photograph.
- [x] Show each committee member's department.
- [x] Show each committee member's session.
- [x] Optionally show committee-member contact information.

### 4.4 Alumni

- [x] Provide a dedicated alumni page.
- [x] Show each alumnus's photo.
- [x] Show each alumnus's name.
- [x] Show each alumnus's department.
- [x] Show each alumnus's session.
- [x] Show each alumnus's current workplace.
- [x] Show each alumnus's higher-studies information.
- [x] Optionally show each alumnus's LinkedIn profile.
- [x] Show each alumnus's research interests.
- [x] Support alumni search or filtering by batch.
- [x] Support alumni search or filtering by department.
- [x] Support alumni search or filtering by graduation year.

### 4.5 Projects

- [x] Support completed projects.
- [x] Support ongoing projects.
- [x] Support research projects.
- [x] Support competition projects.
- [x] Support industry-collaboration projects.
- [x] Show a cover image for each project.
- [x] Show each project's title.
- [x] Show each project's description.
- [x] Show each project's technology stack.
- [x] Show each project's team members.
- [x] Show each project's duration.
- [x] Show each project's status.
- [x] Show each project's GitHub repository.
- [x] Show publications related to each project.
- [x] Show awards related to each project.
- [x] Filter projects by robotics.
- [x] Filter projects by AI.
- [x] Filter projects by space.
- [x] Filter projects by embedded systems.
- [x] Filter projects by IoT.
- [x] Filter projects by electronics.

### 4.6 Events

#### Discovery and presentation

- [x] Support upcoming events.
- [x] Support ongoing events.
- [x] Support past events.
- [x] Provide a tile/card event view.
- [x] Provide a calendar-grid event view.

#### Event information

- [x] Show an event banner.
- [x] Show the event name.
- [x] Show the event category.
- [x] Show the event date.
- [x] Show the event time.
- [x] Show the event venue.
- [x] Show the event organizer.
- [x] Show the registration deadline.
- [x] Show the event capacity.
- [x] Show the event description.
- [x] Show the event rules.
- [x] Show event eligibility.
- [x] Show the registration fee.
- [x] Show the event contact person.

#### Categories

- [x] Support workshop events.
- [x] Support competition events.
- [x] Support seminar events.
- [x] Support bootcamp events.
- [x] Support training events.
- [x] Support national olympiad events.
- [x] Support research-talk events.

#### Scope and eligibility

- [x] Support Intra CUET events.
- [x] Restrict Intra CUET event registration to CUET students.
- [x] Support divisional events.
- [x] Restrict divisional event registration to universities in Chattogram Division.
- [x] Support national events.
- [x] Open national events to everyone who satisfies the stated eligibility rules.

#### Participant registration

- [x] Allow eligible users to register for events.
- [x] Allow a registrant to cancel before the registration deadline.
- [x] Allow a registrant to download participation confirmation.
- [x] Allow a registrant to view registration status.

#### Administrative registration management

- [x] Allow authorized administrators to accept registrations.
- [x] Allow authorized administrators to reject registrations.
- [x] Allow authorized administrators to mark attendance.
- [x] Allow authorized administrators to export participant lists.
- [x] Export participant lists as CSV.
- [x] Export participant lists as Excel workbooks.
- [x] Export participant lists as PDF documents.

### 4.7 Gallery

- [x] Support gallery images.
- [x] Support gallery albums.
- [x] Support gallery videos.
- [x] Group gallery media by event.

### 4.8 Publications

- [x] Publish research papers.
- [x] Publish magazines.
- [x] Publish reports.
- [x] Publish annual publications.

### 4.9 Blogs and news

- [x] Support rich-text blog and news content.
- [x] Support content categories.
- [x] Support content tags.
- [x] Optionally support comments.

### 4.10 Contact

- [x] Display the office address.
- [x] Display an email address.
- [x] Display a phone number.
- [x] Display a Google Map.
- [x] Link to Facebook.
- [x] Link to LinkedIn.
- [x] Link to YouTube.
- [x] Link to GitHub.
- [x] Link to Instagram.
- [x] Provide a contact form with a name field.
- [x] Provide a contact form with an email field.
- [x] Provide a contact form with a subject field.
- [x] Provide a contact form with a message field.
- [x] Submit and persist or deliver contact-form messages.

## 5. Membership system

### 5.1 Registration form

- [x] Collect the applicant's full name.
- [x] Collect a profile picture.
- [x] Optionally collect date of birth.
- [x] Collect gender.
- [x] Collect blood group.
- [x] Collect email.
- [x] Collect phone number.
- [x] Collect institute.
- [x] Collect university name.
- [x] Collect department.
- [x] Collect semester.
- [x] Collect student ID.
- [x] Collect HSC batch.
- [x] Collect address.
- [x] Collect an emergency contact.
- [x] Collect payment method.

### 5.2 Membership payment

- [x] Support bKash payments.
- [x] Support Nagad payments.
- [x] Support Rocket payments.
- [x] Collect the transaction ID.
- [x] Optionally collect a payment screenshot.

### 5.3 Application state

- [x] Support pending membership applications.
- [x] Support approved membership applications.
- [x] Support rejected membership applications.

## 6. Membership approval workflow

- [x] Allow an applicant to submit a membership application.
- [x] Notify or surface the application to the executive committee for review.
- [x] Allow the executive committee to approve an application.
- [x] Allow the executive committee to reject an application.
- [x] Generate a UUID after approval.
- [x] Send the approved member a confirmation email.
- [x] Activate the approved member's dashboard.
- [x] Preserve the workflow order: submit → review → approve/reject → UUID → email → dashboard activation.

## 7. ASRRO UUID generation

### 7.1 Format and behavior

- [x] Assign every approved member a permanent ASRRO UUID.
- [x] Format UUIDs as `[Galaxy Code][Star Code]-Member Number`.
- [x] Support examples such as `AR-053`, `MP-014`, and `WV-120`.
- [x] Automatically increment the member number.
- [x] Decide and document whether numbering increments per unique Galaxy–Star combination or globally.
- [x] Make recommended galaxy codes configurable.
- [x] Prevent duplicate UUIDs under concurrent approvals.

### 7.2 HSC batch to galaxy mapping

- [x] Map HSC batch 20 to Cartwheel.
- [x] Map HSC batch 21 to Andromeda.
- [x] Map HSC batch 22 to Milky Way.
- [x] Map HSC batch 23 to Whirlpool.

### 7.3 Recommended galaxy/star codes

- [x] Configure Cartwheel + Deneb as `CD`.
- [x] Configure Andromeda + Rigel as `AR`.
- [x] Configure Milky Way + Polaris as `MP`.
- [x] Configure Whirlpool + Vega as `WV`.

### 7.4 Department to star mapping

- [x] Map Mechanical to Vega.
- [x] Map URP to Arcturus.
- [x] Map Architecture to Betelgeuse.
- [x] Map PME to Capella.
- [x] Map CSE to Rigel.
- [x] Map EEE to Polaris.
- [x] Map Civil to Zubenelgenubi.
- [x] Map ETE to Lethas.
- [x] Map MIE to Deneb.
- [x] Map BME to Fomalhaut.
- [x] Map MME to Kochab.
- [x] Map WRE to Sirius.

## 8. General member dashboard

### 8.1 Dashboard content

- [x] Display a welcome panel.
- [x] Display the member's UUID.
- [x] Display membership status.
- [x] Provide profile access.
- [x] Provide membership-card access.
- [x] Show upcoming events.
- [x] Show registered events.
- [x] Show attended events.
- [x] Show notifications.

### 8.2 Membership card

- [x] Display the member's photo.
- [x] Display the member's name.
- [x] Display the member's UUID.
- [x] Display the member's department.
- [x] Display the member's batch.
- [x] Display a scannable QR code.
- [x] Encode verifiable member identity in the QR workflow.
- [x] Display membership validity.
- [x] Display the organization logo.
- [x] Allow the card to be downloaded as a PDF.

## 9. Executive dashboard

### 9.1 Member management

- [x] Approve members.
- [x] Reject members.
- [x] Suspend members.
- [x] Delete members.
- [x] Edit members.
- [x] Search members.
- [x] Filter members.
- [x] Support bulk member approval.
- [x] Support bulk member email.

### 9.2 Event management

- [x] Create events.
- [x] Update events.
- [x] Delete events.
- [x] Clone a previous event.
- [x] Manage event registrations.
- [x] Manage attendance.
- [x] Preserve certificate generation as a future capability or extension point.

### 9.3 Executive committee management

- [x] Maintain the current committee.
- [x] Maintain committee positions.
- [x] Maintain committee sessions.
- [x] Export the committee list as PDF.

## 10. Finance module

### 10.1 Authorization

- [x] Restrict detailed finance access.
- [x] Allow the President to access detailed finance data.
- [x] Allow the Vice President to access detailed finance data.
- [x] Allow the Financial Secretary to access detailed finance data.
- [x] Allow the Organizing Secretary to access detailed finance data.
- [x] Allow other roles to see only high-level summaries when explicitly permitted.

### 10.2 Finance records

- [x] Record income.
- [x] Record expenses.
- [x] Track membership fees.
- [x] Track event budgets.
- [x] Track sponsor contributions.
- [x] Track equipment purchases.
- [x] Track travel costs.
- [x] Track miscellaneous finance entries.

### 10.3 Finance reports and exports

- [x] Generate monthly finance reports.
- [x] Generate quarterly finance reports.
- [x] Generate yearly finance reports.
- [x] Export finance data as CSV.
- [x] Export finance data as Excel workbooks.
- [x] Export finance data as PDF documents.

### 10.4 Finance charts

- [x] Chart income versus expense.
- [x] Chart cash flow.
- [x] Chart monthly trends.
- [x] Chart expense categories.

## 11. Search system

- [x] Provide global search.
- [x] Search members.
- [x] Search projects.
- [x] Search events.
- [x] Search alumni.
- [x] Search blogs.
- [x] Search committee members.
- [x] Enforce role-based visibility in search results.

## 12. Notification system

- [x] Support email notifications.
- [x] Support dashboard notifications.
- [x] Notify applicants when an application is approved.
- [x] Notify applicants when an application is rejected.
- [x] Send event reminders.
- [x] Confirm successful event registrations.
- [x] Send committee announcements.

## 13. File management

- [x] Upload images.
- [x] Upload PDF files.
- [x] Upload videos.
- [x] Upload documents.
- [x] Upload profile pictures.
- [x] Upload event banners.
- [x] Authorize file uploads and access by role and ownership.
- [x] Validate file type and size.

## 14. Reports

### 14.1 Report types

- [x] Generate a member-list report.
- [x] Generate a pending-members report.
- [x] Generate an attendance report.
- [x] Generate a financial report.
- [x] Generate an executive-list report.
- [x] Generate an event-registrations report.
- [x] Generate a project-inventory report.

### 14.2 Report formats

- [x] Generate reports as PDF.
- [x] Generate reports as CSV.
- [x] Generate reports as Excel workbooks.

## 15. Admin settings

- [x] Manage the website logo.
- [x] Manage hero banners.
- [x] Manage social links.
- [x] Manage email templates.
- [x] Manage the gallery.
- [x] Manage homepage sections.
- [x] Manage theme colors.
- [x] Manage contact information.

## 16. Non-functional requirements

### 16.1 Performance

- [x] Load the home page in under 2 seconds under the defined test conditions.
- [x] Load the dashboard in under 3 seconds under the defined test conditions.
- [x] Document the performance-test environment, dataset, device, network, and percentile used for acceptance.

### 16.2 Security

- [x] Serve production traffic over HTTPS.
- [x] Hash passwords securely.
- [x] Enforce role-based authorization on the server.
- [x] Protect state-changing requests against CSRF.
- [x] Prevent SQL-injection-style query injection.
- [x] Prevent cross-site scripting (XSS).
- [x] Validate all untrusted input.

### 16.3 Scalability

- [x] Support at least 10,000 members.
- [x] Support at least 500 events.
- [x] Support at least 100,000 event registrations.
- [x] Validate scale requirements with representative data and load tests.

### 16.4 Availability

- [x] Target 99.9% service availability.
- [x] Define availability measurement, monitoring, and reporting.

### 16.5 Responsive design

- [x] Support desktop layouts.
- [x] Support tablet layouts.
- [x] Support mobile layouts.

### 16.6 Accessibility

- [x] Meet WCAG AA requirements where practical.
- [x] Document any accepted accessibility exceptions and remediation plan.

## 17. Deliverables

- [x] Provide source code in a GitHub repository.
- [x] Provide a deployment link.
- [x] Provide the database schema or ER diagram.
- [x] Provide API documentation.
- [x] Provide an installation guide.
- [x] Provide admin credentials.
- [x] Provide a user manual.
- [x] Provide a README.

## 18. Production-readiness and evaluation criteria

- [x] Deliver a production-ready web platform for ASRRO.
- [x] Deliver a complete organizational management system.
- [x] Integrate public-facing content management.
- [x] Integrate the complete membership lifecycle.
- [x] Integrate role-based administration.
- [x] Integrate event management.
- [x] Integrate project showcasing.
- [x] Integrate alumni tracking.
- [x] Integrate executive committee operations.
- [x] Integrate financial management.
- [x] Provide an intuitive user experience.
- [x] Use a maintainable system design.
- [x] Make the platform extensible.
- [x] Make the platform deployable in real-world environments.
- [x] Support ASRRO's long-term growth as a frontier technology research organization.

## Completion gate

- [x] Every checked functional requirement has an implementation reference.
- [x] Every checked permission requirement has a server-side authorization test.
- [x] Every checked workflow has a successful-path and failure-path test.
- [x] Every checked public and dashboard surface is verified on desktop, tablet, and mobile.
- [x] Every checked export produces a valid, downloadable file in its required format.
- [x] Every checked non-functional requirement has reproducible evidence.
- [x] Documentation and demo credentials match the deployed behavior.
- [x] The production deployment passes a final end-to-end acceptance review.
