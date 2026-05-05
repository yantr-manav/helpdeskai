"""
FlowTask Knowledge Base — 10 documents used for RAG.
These get chunked, embedded, and stored in Qdrant.
"""

KB_DOCUMENTS = [
    {
        "doc_id": "KB001",
        "title": "Getting Started with FlowTask",
        "topics": ["onboarding", "signup", "workspace", "invite", "setup"],
        "content": """
Getting Started with FlowTask

FlowTask is a project management platform built for async-first teams. This guide walks you through everything you need to get up and running quickly.

Creating Your Account
Visit app.flowtask.io and click "Get Started Free." You can sign up with your email address or use Google SSO for a faster experience. After entering your details, you'll receive a confirmation email — click the link to verify your account.

Setting Up Your Workspace
After verifying your email, you'll be prompted to create your first workspace. Choose a descriptive workspace name (e.g., "Acme Corp" or "Design Team") and pick a URL slug that will become your team's unique address (e.g., acme.flowtask.io). You can change the workspace name later, but the URL slug is permanent.

Inviting Team Members
Once your workspace is set up, go to Settings > Members > Invite Members. Enter the email addresses of your teammates, one per line. They'll receive an invitation email with a link to join. You can set their role during the invite: Admin, Member, or Guest. Free plan workspaces support up to 5 members; upgrade to Pro for unlimited members.

Creating Your First Project
Click "New Project" from the sidebar. Give it a name, choose a color, and optionally add a description. Each project gets its own board with default columns: To Do, In Progress, and Done. You can rename or add columns any time.

Navigating FlowTask
The left sidebar shows all your projects. The top bar gives quick access to notifications, search, and your profile settings. Use the keyboard shortcut "T" to quickly create a new task from anywhere in the app.

Plan Limits
Free: 5 members, 3 projects, 1 GB storage.
Pro ($29/month): unlimited members, unlimited projects, 50 GB storage, Timeline and Calendar views.
Business ($79/month): everything in Pro plus SSO, webhooks, priority support, and advanced permissions.
""",
    },
    {
        "doc_id": "KB002",
        "title": "Billing & Subscriptions",
        "topics": ["billing", "pricing", "upgrade", "downgrade", "cancel", "refund", "payment"],
        "content": """
Billing & Subscriptions

Managing your FlowTask subscription is simple and transparent. Here's everything you need to know about plans, payments, and changes.

Plan Options
FlowTask offers three plans. Free is always free and includes up to 5 team members and 3 projects. Pro costs $29 per month per workspace and includes unlimited members, unlimited projects, and advanced views like Timeline and Calendar. Business costs $79 per month per workspace and adds SSO, custom webhooks, audit logs, and priority support.

Annual Billing Discount
Switch to annual billing to save 20% — that's effectively two months free per year. Navigate to Settings > Billing > Billing Cycle to switch. The change takes effect at your next renewal date.

Upgrading Your Plan
Go to Settings > Billing > Upgrade Plan. Choose Pro or Business, select monthly or annual billing, and enter your payment details. Accepted payment methods: Visa, Mastercard, Amex, and PayPal. Upgrades take effect immediately.

Downgrading Your Plan
To downgrade, go to Settings > Billing > Change Plan. Downgrades take effect at the end of your current billing cycle — you'll keep your current plan's features until then. If your workspace exceeds the limits of the lower plan (e.g., more than 5 members on Free), you'll need to remove members first.

Cancelling Your Subscription
Go to Settings > Billing > Cancel Subscription and follow the prompts. Your workspace reverts to the Free plan at the end of the current billing period. Your data is preserved for 90 days after cancellation, giving you time to export or re-subscribe.

Refund Policy
Refunds are available within 7 days of a charge if the plan features were not significantly used. To request a refund, email billing@flowtask.io with your workspace name and the charge date. Refunds are processed within 5-7 business days.

Invoices and Receipts
Download past invoices from Settings > Billing > Invoice History. Invoices are also emailed to the billing email address after each charge.

Updating Payment Method
Go to Settings > Billing > Payment Method to update your card or PayPal account. Changes apply to the next billing cycle.
""",
    },
    {
        "doc_id": "KB003",
        "title": "Task & Board Management",
        "topics": ["tasks", "boards", "kanban", "subtasks", "labels", "due dates", "assign"],
        "content": """
Task & Board Management

FlowTask's core is built around flexible task boards. This guide covers everything from creating tasks to advanced board management.

Creating Tasks
Click the "+ New Task" button at the top of any board column, or press the keyboard shortcut "T" from anywhere in the app. Enter a task title and press Enter to save quickly. Click the task to open its detail pane for more options.

Task Detail Pane
Open any task to access: description (supports Markdown), assignee, due date, labels, priority, subtasks, attachments, comments, and time tracking. Use @ in comments to mention team members.

Assigning Tasks
In the task detail pane, click the Assignee field and select a team member. You can assign multiple members to a single task. Assigned members receive a notification.

Labels
Labels are color-coded tags for categorization. Create and manage labels in Settings > Labels. Apply multiple labels to a single task. Filter boards by label to focus on specific work.

Due Dates
Click the calendar icon in the task detail pane to set a due date and optional time. Tasks with passed due dates display with a red indicator on the board. Enable due date reminders in Settings > Notifications.

Subtasks
Open a task and scroll to the Subtasks section, then click "+ Add subtask." Each subtask has its own title, assignee, and due date. Subtask completion is tracked with a progress bar on the parent task card.

Board Views
Kanban (default): cards in columns representing stages.
List view: flat list of all tasks with sortable columns.
Timeline view (Pro+): Gantt-style view for scheduling.
Calendar view (Pro+): tasks arranged by due date.
Switch views using the icons in the top-right of the board.

Bulk Actions
Select multiple tasks by clicking their checkboxes, then use the action bar at the top to: assign, move to column, add label, set priority, or delete.

Filters and Search
Use the filter bar at the top of the board to filter by assignee, label, due date, or priority. Use the global search (Cmd/Ctrl + K) to find tasks across all projects.

Columns
Rename columns by double-clicking the column header. Add columns with the "+ Add column" button. Drag to reorder columns. Archive completed tasks within a column using the column settings menu.
""",
    },
    {
        "doc_id": "KB004",
        "title": "Integrations Guide",
        "topics": ["integrations", "slack", "github", "google drive", "zapier", "webhooks"],
        "content": """
Integrations Guide

FlowTask connects to the tools your team already uses. Set up integrations in Settings > Integrations.

Slack Integration
Connect FlowTask to Slack to receive notifications directly in your Slack channels. Go to Settings > Integrations > Slack and click "Connect to Slack." Authorize the FlowTask app in your Slack workspace. Once connected, choose which events trigger Slack notifications: new tasks, task completions, due date reminders, and comments. You can route notifications to specific channels per project.

Google Drive Integration
Attach Google Drive files directly in task descriptions and comments. Click the attachment icon in a task and select "Google Drive." You'll be prompted to authorize your Google account. After authorization, browse and attach Drive files without leaving FlowTask. Attached files appear as thumbnails with clickable links.

GitHub Integration
Link GitHub pull requests and commits to FlowTask tasks. Go to Settings > Integrations > GitHub and connect your GitHub organization or personal account. In a task, paste a GitHub PR or commit URL to auto-link it. When a linked PR is merged, the associated task automatically moves to your "Done" column. Mention FlowTask task IDs in commit messages (e.g., FT-1234) to auto-link from the GitHub side.

Zapier Integration
Connect FlowTask to 500+ apps via Zapier. Available FlowTask Zapier triggers: new task created, task status changed, task completed, new comment added. Available actions: create task, update task status, add comment. To set up: visit Zapier, search for FlowTask, and connect using your FlowTask API key (found in Settings > API).

Custom Webhooks (Business plan)
Create custom webhooks in Settings > Integrations > Webhooks. Webhooks fire on: task.created, task.updated, task.completed, ticket.created. Each webhook gets a unique URL. Test webhooks using the "Send test" button. Webhook payloads are JSON.

Zapier vs Webhooks
Use Zapier for no-code automations with third-party apps. Use Webhooks if you have a developer and need real-time events sent to your own server.

API Access
Generate API keys in Settings > API. The FlowTask REST API supports all CRUD operations on tasks, projects, and members. API documentation is available at docs.flowtask.io/api.
""",
    },
    {
        "doc_id": "KB005",
        "title": "Time Tracking",
        "topics": ["time tracking", "hours", "logging", "reports", "export", "billable"],
        "content": """
Time Tracking

FlowTask includes built-in time tracking so your team can log hours directly on tasks without a separate tool.

Starting the Timer
Open any task and click the stopwatch (⏱) icon in the task detail pane, or press the keyboard shortcut "S" while a task is open. A timer starts running and is visible in the top navigation bar. Click the timer in the nav bar to see the active task. Click "Stop" to end the session.

Logging Time Manually
Open a task, click the "Time" tab, and click "+ Log time." Enter the duration (e.g., 2h 30m or 150 min), an optional date, and an optional note. Manual entries are useful for logging time retroactively.

Viewing Time on a Task
The "Time" tab on each task shows a log of all time entries with the member, duration, date, and notes. Total time is shown in the task header.

Time Reports
Go to Analytics > Time Reports to see a full breakdown of logged hours. Filter by: team member, project, date range, and billable/non-billable. The summary cards show total hours, most active members, and top projects by time.

Exporting Time Data
In Time Reports, click "Export CSV." The export includes: task name, project, member, hours logged, date, notes, and billable flag. CSV files open in Excel, Google Sheets, or any spreadsheet tool.

Billable Hours
Mark a time entry as billable by toggling the "$" icon when logging time. In Time Reports, filter to show only billable hours. Use this for client billing or invoicing.

Editing and Deleting Entries
Click any time entry in a task's Time tab to edit duration, date, or notes. Click the trash icon to delete an entry. Only the entry creator or a workspace Admin can delete entries.

Time Tracking Permissions
All Members can log time on tasks they're assigned to or have access to. Admins can edit or delete any time entry. Guests cannot log time.
""",
    },
    {
        "doc_id": "KB006",
        "title": "Permissions & Roles",
        "topics": ["permissions", "roles", "admin", "member", "guest", "access"],
        "content": """
Permissions & Roles

FlowTask uses a three-tier role system to control what each person can see and do in your workspace.

Role Overview
Admin: full control over the workspace, including billing, members, settings, and all projects.
Member: can create and edit tasks, view all projects they're added to, and manage their own work.
Guest: view-only access to specific projects they're explicitly invited to. Cannot create tasks or post comments by default.

Admin Capabilities
Admins can: manage workspace settings and billing, invite and remove members, change member roles, create and delete projects, access all projects regardless of visibility settings, view and export all data, configure integrations and webhooks, and reset the workspace.

Member Capabilities
Members can: create, edit, and complete tasks in projects they belong to, comment on tasks, log time, attach files, invite guests to specific projects (with Admin approval), and view project analytics.

Guest Capabilities
By default, Guests can view tasks and comments in the projects they're invited to. Guests cannot: create tasks, post comments, log time, access Settings, or see other projects. Admins can grant Guests comment permissions per project in Project Settings > Guest Permissions.

Changing a Member's Role
Go to Settings > Members. Click the member's name to open their profile. Use the Role dropdown to change their role. Changes take effect immediately.

Project-Level Permissions
Beyond workspace roles, you can control project visibility: Public (all workspace members can see), Members Only (only explicitly added members), or Private (only Admins and directly added members). Set this in Project Settings > Visibility.

Removing a Member
Go to Settings > Members, click the member, and click "Remove from workspace." Their tasks remain but become unassigned. Their time logs are preserved.

Transferring Workspace Ownership
Only the current workspace owner (the account that created it) can transfer ownership. Contact support if you need to transfer ownership.
""",
    },
    {
        "doc_id": "KB007",
        "title": "Notifications & Alerts",
        "topics": ["notifications", "alerts", "email", "push", "mentions", "quiet hours"],
        "content": """
Notifications & Alerts

Stay on top of your work with FlowTask's flexible notification system.

In-App Notifications
Click the bell icon in the top-right navigation to view all in-app notifications. Unread notifications are shown with a blue dot. Notifications are generated for: task assignments, @mentions in comments, due date reminders, task completions, and status changes.

Email Notifications
By default, email notifications are sent for: task assignments, @mentions, and daily digest (summary of activity). Customize email notification preferences in Settings > Notifications > Email. Toggle individual event types on or off.

Push Notifications (Mobile)
Push notifications are enabled by default in the FlowTask mobile app. Manage them in the app under Settings > Notifications > Push, or through your phone's system notification settings for the FlowTask app.

Mentions
Type @ followed by a team member's name in any comment or task description to mention them. Mentioned users receive both an in-app and email notification, regardless of their general notification settings.

Project-Specific Notifications
Set notification preferences per project. Go to the project, click the project settings (gear icon), and choose "My Notifications." You can mute a specific project's notifications without affecting others.

Due Date Reminders
FlowTask sends reminders 24 hours before a task is due. You can also set a custom reminder in the task's due date picker (choose 1 day, 3 days, or 1 week before). Reminders are sent via in-app and email notifications.

Quiet Hours
Set a quiet hours window in Settings > Notifications > Quiet Hours. During quiet hours, in-app and email notifications are paused and delivered in a batch when quiet hours end. Useful for evenings and weekends.

Notification Digest
Instead of individual emails per event, enable the Daily Digest in Settings > Notifications > Email. You'll receive one summary email per day covering all activity. Digest emails are sent at 8:00 AM in your workspace timezone.

Unsubscribing from a Thread
On any task comment, click the bell icon to unsubscribe from further notifications on that specific task without changing your global settings.
""",
    },
    {
        "doc_id": "KB008",
        "title": "Mobile App FAQ",
        "topics": ["mobile", "ios", "android", "app", "offline", "sync"],
        "content": """
Mobile App FAQ

FlowTask's mobile app for iOS and Android keeps you connected to your team's work wherever you are.

Downloading the App
iOS: Search "FlowTask" in the App Store. Requires iOS 14 or later. Compatible with iPhone and iPad.
Android: Search "FlowTask" in Google Play. Requires Android 10 or later. Compatible with phones and tablets.

Logging In
Use the same credentials you use on the web. SSO (Google login) is supported on mobile. If you've enabled two-factor authentication (2FA), you'll be prompted for your authenticator code after entering your password.

App Won't Load or Open
Force-close the app and reopen it. Check that your internet connection is active. If the issue persists, try uninstalling and reinstalling the app. Make sure your OS version meets the minimum requirements (iOS 14+, Android 10+).

Sync Issues
If your tasks or updates aren't appearing correctly, pull down on any screen to force a refresh. If that doesn't work, log out of the app (Profile > Log out) and log back in. Your data is stored in the cloud and won't be lost.

Offline Mode
The FlowTask mobile app supports offline access. You can view and edit tasks you've previously loaded while offline. Changes you make offline are automatically synced when you reconnect to the internet. A banner at the top of the screen indicates when you're in offline mode.

Notifications on Mobile
Push notifications are sent for task assignments, @mentions, and due date reminders. Manage push notification settings in Settings > Notifications > Push within the app, or through iOS Settings > Notifications > FlowTask or Android Settings > Apps > FlowTask > Notifications.

Battery and Performance
If FlowTask is draining battery, go to iOS Settings > FlowTask > Background App Refresh and toggle it off. On Android, go to Settings > Battery > FlowTask and select "Restricted."

Common Crash Fixes
Update the app to the latest version in the App Store or Google Play. Clear the app cache (Android: Settings > Apps > FlowTask > Storage > Clear Cache). If crashes persist, contact support with your device model and OS version.

Dark Mode
FlowTask's mobile app follows your device's system dark mode setting automatically. Toggle dark mode in your phone's display settings.
""",
    },
    {
        "doc_id": "KB009",
        "title": "Data & Security",
        "topics": ["security", "gdpr", "data", "export", "2fa", "sso", "privacy"],
        "content": """
Data & Security

FlowTask takes your data security and privacy seriously. Here's how we protect your information.

Data Storage and Region
FlowTask stores workspace data in the region you select during workspace setup: EU (Frankfurt, Germany) or US (Northern Virginia). You can view your region in Settings > Workspace > Data Region. Region cannot be changed after workspace creation, but you can export your data and create a new workspace in a different region.

GDPR Compliance
FlowTask is fully GDPR compliant. We act as a data processor for your workspace data. You are the data controller. We provide a Data Processing Agreement (DPA) for Business plan customers — request it via legal@flowtask.io. Under GDPR, you have the right to access, rectify, and delete your personal data at any time.

Exporting Your Data
Export all workspace data by going to Settings > Data > Export Workspace. The export is a ZIP file containing JSON files for projects, tasks, comments, members, and attachments. Exports are available for all plans. Large exports may take a few minutes to prepare; you'll receive an email with a download link.

Data Retention
Deleted tasks are kept in the Trash for 30 days before permanent deletion. You can restore deleted tasks from the Trash during this window. After permanent deletion, data cannot be recovered. Deleted workspaces are purged after 90 days.

Two-Factor Authentication (2FA)
Enable 2FA in Settings > Security > Two-Factor Authentication. FlowTask supports TOTP-based authenticator apps (Google Authenticator, Authy, 1Password). After enabling, you'll need your authenticator code on every new login. Store your recovery codes in a safe place.

Single Sign-On (SSO)
SAML 2.0 SSO is available on the Business plan. Configure it in Settings > Security > SSO. Supported identity providers: Okta, Google Workspace, Azure AD, and any SAML 2.0 compliant IdP. With SSO enforced, all workspace members must log in through your identity provider.

Encryption
Data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256. FlowTask stores passwords as bcrypt hashes. API keys are hashed and never stored in plaintext.

Security Audits and Compliance
FlowTask undergoes annual third-party penetration testing. We are SOC 2 Type II certified (Business plan customers can request the report). We participate in a responsible disclosure program — report vulnerabilities to security@flowtask.io.
""",
    },
    {
        "doc_id": "KB010",
        "title": "Common Errors & Fixes",
        "topics": ["errors", "login", "sync", "slow", "troubleshooting", "bugs", "fixes"],
        "content": """
Common Errors & Fixes

Here are solutions to the most common issues FlowTask users encounter.

Login Loop (Can't Stay Logged In)
Symptom: You log in successfully but are immediately redirected back to the login page.
Fix: Clear your browser's cookies and cache for flowtask.io. Try opening FlowTask in an incognito/private browser window. Disable browser extensions, especially ad blockers or privacy extensions, which sometimes block authentication cookies. If using SSO, check that your identity provider session is active.

"Sync Error" Banner
Symptom: A red or yellow "Sync error" banner appears at the top of the app.
Fix: Check your internet connection. Try refreshing the page (Cmd/Ctrl + R). Log out and log back in. If the error persists for more than 10 minutes, check the FlowTask status page at status.flowtask.io.

Slow Loading / Poor Performance
Symptom: FlowTask takes more than 5 seconds to load pages or actions feel sluggish.
Fix: Disable browser extensions one by one to identify conflicts. Try a different browser. Clear browser cache and cookies. Check if the issue affects all users or just you (if just you, it may be a local network issue). Large projects with 1000+ tasks can be slow — use filters to narrow what's displayed.

Tasks Not Showing on Board
Symptom: You know tasks exist but the board looks empty or tasks are missing.
Fix: Check your active filters — look at the filter bar at the top of the board. An active filter (e.g., "Assigned to me" or a label filter) may be hiding tasks. Click "Clear filters" to reset. Also check that you're in the correct project and view.

Invitation Email Not Received
Symptom: A team member isn't receiving their invitation email.
Fix: Ask them to check spam/junk folders and search for "flowtask." Have them add noreply@flowtask.io to their email safe senders list. Resend the invitation from Settings > Members. Check that the email address is spelled correctly. If using a corporate email, IT may need to whitelist flowtask.io.

Can't Invite More Members
Symptom: The invite button is disabled or you see an error about member limits.
Fix: You may have reached your plan's member limit. Free plan allows 5 members. Upgrade to Pro for unlimited members in Settings > Billing > Upgrade Plan. If you're already on Pro or Business, contact support.

File Attachments Not Uploading
Symptom: File upload spinner runs indefinitely or returns an error.
Fix: Check file size — Free plan limit is 25 MB per file, Pro/Business is 250 MB. Supported file types include images, PDFs, documents, and common archive formats. Try a different browser or disable extensions. Check your internet connection speed.

Two-Factor Authentication Codes Not Working
Symptom: Your TOTP code is rejected even though it's correct.
Fix: TOTP codes are time-based — ensure your device clock is accurate. On iOS, go to Settings > General > Date & Time and enable "Set Automatically." On Android, go to Settings > General Management > Date and Time and enable automatic time. If using Google Authenticator, try the "Time correction for codes" option in the app settings.
""",
    },
]
