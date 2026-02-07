# Architecture

## Project Tree (snapshot)

## Project Tree

```text
📦_components
 ┣ 📜DeleteConfirmModal.tsx
 ┣ 📜EditRoleForm.tsx
 ┣ 📜ErrorAlert.tsx
 ┣ 📜LoadingState.tsx
 ┣ 📜ManageMembersTab.tsx
 ┣ 📜RoleModal.tsx
 ┣ 📜roles.scss
 ┣ 📜RolesActionBar.tsx
 ┣ 📜RolesSearchBar.tsx
 ┗ 📜RolesTable.tsx
📦app
 ┣ 📂(auth-pages)
 ┃ ┣ 📂forgot-password
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂sign-in
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂sign-up
 ┃ ┃ ┣ 📜opengraph-image.tsx
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📜layout.tsx
 ┃ ┗ 📜smtp-message.tsx
 ┣ 📂api
 ┃ ┣ 📂analytics
 ┃ ┃ ┣ 📂dashboard
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂devices
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂event
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂performance
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂track
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📂visitors
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂apply-invite
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂calendar
 ┃ ┃ ┣ 📂event-types
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂events
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂log-hours
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂logged-hours-range
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂public-events
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂sls-events
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📂work-locations
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂catalog
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂documents
 ┃ ┃ ┣ 📂activity
 ┃ ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂favorites
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂make-private
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂make-public
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂share
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂upload
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂[id]
 ┃ ┃ ┃ ┣ 📂download
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂move
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂preview
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂genpunch
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂get-all-users
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂invite
 ┃ ┃ ┣ 📂create
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂[code]
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂messages
 ┃ ┃ ┣ 📂get-conversations
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂send
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂start-dm
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂start-group
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📂[channel_id]
 ┃ ┃ ┃ ┣ 📂delete
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂notifications
 ┃ ┃ ┣ 📂create-message
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂mark-read
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂send
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂[userId]
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂products
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂profile
 ┃ ┃ ┣ 📂admin-delete-user
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂role-label
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂set-role
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂specializations
 ┃ ┃ ┃ ┣ 📂add-members
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂assign
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂create
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂delete
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂get-all
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂get-members
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂get-user-specializations
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂remove
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂remove-members
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂update
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂[id]
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂public
 ┃ ┃ ┗ 📂assets
 ┃ ┃ ┃ ┗ 📂[...path]
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂schedule
 ┃ ┃ ┣ 📂businesses
 ┃ ┃ ┃ ┣ 📂notes
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂daily-instances
 ┃ ┃ ┃ ┣ 📂monthly
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂moved
 ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂members
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┣ 📂update
 ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜route.ts
 ┃ ┗ 📂Weather
 ┃ ┃ ┗ 📜route.ts
 ┣ 📂auth
 ┃ ┣ 📂callback
 ┃ ┃ ┣ 📂oauth
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┗ 📜route.ts
 ┃ ┣ 📂logout
 ┃ ┃ ┗ 📜route.ts
 ┃ ┗ 📜session.ts
 ┣ 📂catalog
 ┃ ┣ 📜add.tsx
 ┃ ┣ 📜catalog.tsx
 ┃ ┣ 📜layout.tsx
 ┃ ┣ 📜page.tsx
 ┃ ┣ 📜productManager.tsx
 ┃ ┣ 📜products.tsx
 ┃ ┣ 📜remove.tsx
 ┃ ┣ 📜section.tsx
 ┃ ┗ 📜subsection.tsx
 ┣ 📂CMS
 ┃ ┣ 📂schedule
 ┃ ┃ ┣ 📜layout.tsx
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📜layout.tsx
 ┃ ┣ 📜opengraph-image.png
 ┃ ┣ 📜page.metadata.ts
 ┃ ┗ 📜page.tsx
 ┣ 📂dashboard
 ┃ ┗ 📂[id]
 ┃ ┃ ┣ 📂(home)
 ┃ ┃ ┃ ┣ 📂admin
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜chats-card.tsx
 ┃ ┃ ┃ ┃ ┣ 📜fetch.ts
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂cliant
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜chats-card.tsx
 ┃ ┃ ┃ ┃ ┣ 📜fetch.ts
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂coach
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜chats-card.tsx
 ┃ ┃ ┃ ┃ ┣ 📜fetch.ts
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┃ ┗ 📜chats-card.tsx
 ┃ ┃ ┃ ┣ 📜fetch.ts
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂auth
 ┃ ┃ ┃ ┗ 📂sign-in
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂calendar
 ┃ ┃ ┃ ┣ 📂planner
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📜CalendarContent.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarContextMenu.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarExport.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarHeader.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarMainContent.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarManager.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CalendarTemplateUtils.ts
 ┃ ┃ ┃ ┃ ┣ 📜ClientPersonalTimesheetTemplate.ts
 ┃ ┃ ┃ ┃ ┣ 📜CoachClientTimesheetTemplate.ts
 ┃ ┃ ┃ ┃ ┣ 📜CoachHoursModal.tsx
 ┃ ┃ ┃ ┃ ┣ 📜EventModal.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ExportMessage.tsx
 ┃ ┃ ┃ ┃ ┣ 📜JobCoachPersonalTimesheetTemplate.ts
 ┃ ┃ ┃ ┃ ┣ 📜RoleInfoPanel.tsx
 ┃ ┃ ┃ ┃ ┣ 📜SLSManager.tsx
 ┃ ┃ ┃ ┃ ┣ 📜UserCalendarViewer.tsx
 ┃ ┃ ┃ ┃ ┗ 📜UserRoleInfoPanel.tsx
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂charts
 ┃ ┃ ┃ ┗ 📂basic-chart
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂commercial
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┃ ┗ 📜chats-card.tsx
 ┃ ┃ ┃ ┣ 📜fetch copy.ts
 ┃ ┃ ┃ ┣ 📜fetch.ts
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂Documents
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂forms
 ┃ ┃ ┃ ┣ 📂form-elements
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┗ 📂form-layout
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📜contact-form.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜sign-in-form.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜sign-up-form.tsx
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂messages
 ┃ ┃ ┃ ┣ 📂activity
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ChatBox.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜general_data.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜last_24hrs.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜last_4weeks.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜last_7d.tsx
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📜AboutSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ActionsSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜AttachmentList.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatHeader.scss
 ┃ ┃ ┃ ┃ ┣ 📜ChatHeader.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatInfoSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatMessageBubble.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatMessages.scss
 ┃ ┃ ┃ ┃ ┣ 📜ChatMessages.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatRightSidebar.scss
 ┃ ┃ ┃ ┃ ┣ 📜ChatRightSidebar.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatRightSidebarHeader.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatSidebar.scss
 ┃ ┃ ┃ ┃ ┣ 📜ChatSidebar.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatSidebarHeader.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ChatSidebarSearch.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ConversationList.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ConversationListItem.tsx
 ┃ ┃ ┃ ┃ ┣ 📜DebugPanel.tsx
 ┃ ┃ ┃ ┃ ┣ 📜hatMessageBubble.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MessageAvatar.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MessageContextMenu.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MessageInput.scss
 ┃ ┃ ┃ ┃ ┣ 📜MessageInput.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MessageItem.tsx
 ┃ ┃ ┃ ┃ ┣ 📜mobile.scss
 ┃ ┃ ┃ ┃ ┣ 📜NewChatModal.scss
 ┃ ┃ ┃ ┃ ┣ 📜NewChatModal.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ParticipantList.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ParticipantsSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜PhotoGallery.tsx
 ┃ ┃ ┃ ┃ ┣ 📜SharedMediaSection.tsx
 ┃ ┃ ┃ ┃ ┗ 📜TimestampAndLikes.tsx
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂profile
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┗ 📜social-accounts.tsx
 ┃ ┃ ┃ ┣ 📜layout.tsx
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂settings
 ┃ ┃ ┃ ┣ 📂invites
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📜InviteGenerator.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜InviteGeneratorClient.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜invites.scss
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂members
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┗ 📜members.scss
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂roles
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📜DeleteConfirmModal.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜EditRoleForm.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ErrorAlert.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜LoadingState.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ManageMembersTab.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜RoleModal.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜roles.scss
 ┃ ┃ ┃ ┃ ┃ ┣ 📜RolesActionBar.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜RolesSearchBar.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜RolesTable.tsx
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂thememaker
 ┃ ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ColorPicker.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CSSThemeImporter.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜FontControls.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜Header.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ThemeCreatorSkeleton.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜ThemeForm.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜ThemePreview.tsx
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┃ ┣ 📜personal-info.tsx
 ┃ ┃ ┃ ┃ ┗ 📜upload-photo.tsx
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂tables
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂ui-elements
 ┃ ┃ ┃ ┣ 📂alerts
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┗ 📂buttons
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂_components
 ┃ ┃ ┃ ┣ 📂overview-cards
 ┃ ┃ ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┃ ┃ ┣ 📂region-labels
 ┃ ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┃ ┗ 📜map.tsx
 ┃ ┃ ┃ ┣ 📜chats-card.tsx
 ┃ ┃ ┃ ┗ 📜fetch.ts
 ┃ ┃ ┣ 📂_main-components
 ┃ ┃ ┃ ┣ 📜bottom-card.tsx
 ┃ ┃ ┃ ┣ 📜channels_rows.csv
 ┃ ┃ ┃ ┣ 📜channel_participants_rows.csv
 ┃ ┃ ┃ ┣ 📜Gbnjn-1Q2d8-HD.jpg
 ┃ ┃ ┃ ┣ 📜improved_messaging_engine.sql
 ┃ ┃ ┃ ┣ 📜integration_helper_functions (1).sql
 ┃ ┃ ┃ ┣ 📜integration_helper_functions.sql
 ┃ ┃ ┃ ┣ 📜member-card.tsx
 ┃ ┃ ┃ ┣ 📜messages-card.tsx
 ┃ ┃ ┃ ┣ 📜pages_rows (1).csv
 ┃ ┃ ┃ ┣ 📜pages_rows.csv
 ┃ ┃ ┃ ┗ 📜profiles_rows.csv
 ┃ ┃ ┣ 📜favicon.ico
 ┃ ┃ ┣ 📜layout.tsx
 ┃ ┃ ┗ 📜providers.tsx
 ┣ 📂profile
 ┃ ┗ 📂[id]
 ┃ ┃ ┗ 📜page.tsx
 ┣ 📂protected
 ┃ ┣ 📂reset-password
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┗ 📜page.tsx
 ┣ 📂punchcards
 ┃ ┣ 📂_components
 ┃ ┃ ┣ 📜BatchSettings.tsx
 ┃ ┃ ┣ 📜CardPreview.tsx
 ┃ ┃ ┣ 📜PDFGenerator.tsx
 ┃ ┃ ┗ 📜TemplateSelector.tsx
 ┃ ┣ 📜main.tsx
 ┃ ┣ 📜opengraph-image.png
 ┃ ┣ 📜page.tsx
 ┃ ┗ 📜PunchCardClient.tsx
 ┣ 📂settings
 ┃ ┣ 📂[...setting]
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┗ 📜layout.tsx
 ┣ 📂Tools
 ┃ ┣ 📂[tool]
 ┃ ┃ ┣ 📜opengraph-image.tsx
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📜layout.tsx
 ┃ ┣ 📜page.metadata.ts
 ┃ ┗ 📜page.tsx
 ┣ 📂_components
 ┃ ┣ 📂_dashboard
 ┃ ┃ ┗ 📜chart-preview.tsx
 ┃ ┣ 📂_events
 ┃ ┃ ┗ 📜loading-page.tsx
 ┃ ┗ 📂_shadcn
 ┃ ┃ ┣ 📜sidebar.tsx
 ┃ ┃ ┗ 📜theme-provider.tsx
 ┣ 📜actions.ts
 ┣ 📜favicon.ico
 ┣ 📜globals.css
 ┣ 📜layout.tsx
 ┣ 📜opengraph-image.png
 ┣ 📜page.tsx
 ┣ 📜provider.tsx
 ┗ 📜twitter-image.png
📦assets
 ┣ 📂logos
 ┃ ┣ 📜dark.svg
 ┃ ┣ 📜dartboard.svg
 ┃ ┣ 📜dartlogo.svg
 ┃ ┣ 📜facebook.svg
 ┃ ┣ 📜github.svg
 ┃ ┣ 📜google.svg
 ┃ ┣ 📜index.ts
 ┃ ┣ 📜main.svg
 ┃ ┣ 📜vimeo.svg
 ┃ ┗ 📜x.svg
 ┗ 📜icons.tsx
📦components
 ┣ 📂AdminDashboard
 ┃ ┗ 📜App.tsx
 ┣ 📂Auth
 ┃ ┣ 📂Signin
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📜GoogleSigninButton.tsx
 ┃ ┗ 📜SigninWithPassword.tsx
 ┣ 📂blocks
 ┃ ┗ 📜cookie-consent.tsx
 ┣ 📂Breadcrumbs
 ┃ ┗ 📜Breadcrumb.tsx
 ┣ 📂CalenderBox
 ┃ ┣ 📜CalendarEvent.tsx
 ┃ ┣ 📜DayTooltip.tsx
 ┃ ┣ 📜EventHoverTooltip.tsx
 ┃ ┣ 📜EventTooltip.tsx
 ┃ ┣ 📜index.tsx
 ┃ ┗ 📜QuickActions.tsx
 ┣ 📂Charts
 ┃ ┣ 📂campaign-visitors
 ┃ ┃ ┣ 📜chart.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂payments-overview
 ┃ ┃ ┣ 📜chart.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂used-devices
 ┃ ┃ ┣ 📜chart.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜tabbed-chart.tsx
 ┃ ┗ 📂weeks-profit
 ┃ ┃ ┣ 📜chart.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┣ 📂debug
 ┃ ┗ 📜HallMonitorDebug.tsx
 ┣ 📂documents
 ┃ ┣ 📂Breadcrumb
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂ContextMenu
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂FavoritesBar
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂File
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜styles.scss
 ┃ ┣ 📂FileGrid
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂Folder
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜styles.scss
 ┃ ┣ 📂Preview
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂Toolbar
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜styles.scss
 ┃ ┣ 📂UploadZone
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📜DocumentsErrorBoundary.tsx
 ┃ ┣ 📜icons.tsx
 ┃ ┣ 📜index.tsx
 ┃ ┗ 📜skeleton.tsx
 ┣ 📂FormElements
 ┃ ┣ 📂Checkboxes
 ┃ ┃ ┣ 📜CheckboxFive.tsx
 ┃ ┃ ┣ 📜CheckboxFour.tsx
 ┃ ┃ ┣ 📜CheckboxOne.tsx
 ┃ ┃ ┣ 📜CheckboxThree.tsx
 ┃ ┃ ┗ 📜CheckboxTwo.tsx
 ┃ ┣ 📂DatePicker
 ┃ ┃ ┣ 📜DatePickerOne.tsx
 ┃ ┃ ┗ 📜DatePickerTwo.tsx
 ┃ ┣ 📂InputGroup
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜text-area.tsx
 ┃ ┣ 📂Switchers
 ┃ ┃ ┣ 📜SwitcherFour.tsx
 ┃ ┃ ┣ 📜SwitcherOne.tsx
 ┃ ┃ ┣ 📜SwitcherThree.tsx
 ┃ ┃ ┗ 📜SwitcherTwo.tsx
 ┃ ┣ 📜checkbox.tsx
 ┃ ┣ 📜MultiSelect.tsx
 ┃ ┣ 📜radio.tsx
 ┃ ┣ 📜select.tsx
 ┃ ┗ 📜switch.tsx
 ┣ 📂home
 ┃ ┣ 📂About
 ┃ ┃ ┗ 📜Careers.tsx
 ┃ ┣ 📂BusinessServices
 ┃ ┃ ┣ 📜cms.tsx
 ┃ ┃ ┣ 📜main.tsx
 ┃ ┃ ┣ 📜pickup.tsx
 ┃ ┃ ┗ 📜Shredding.tsx
 ┃ ┣ 📂GetInvolved
 ┃ ┃ ┣ 📜donatenow.tsx
 ┃ ┃ ┗ 📜main.tsx
 ┃ ┣ 📂LearnAndConnect
 ┃ ┃ ┣ 📜AutismDayCamp.tsx
 ┃ ┃ ┗ 📜main.tsx
 ┃ ┣ 📂ProgramsandServices
 ┃ ┃ ┣ 📜EmploymentServices.tsx
 ┃ ┃ ┣ 📜programsndseevices.tsx
 ┃ ┃ ┗ 📜SupportedLiving.tsx
 ┃ ┣ 📂services
 ┃ ┃ ┣ 📜Artists.tsx
 ┃ ┃ ┣ 📜AutismDayCamp.tsx
 ┃ ┃ ┣ 📜CARF.tsx
 ┃ ┃ ┣ 📜EarlyChildhood.tsx
 ┃ ┃ ┣ 📜Employment.tsx
 ┃ ┃ ┣ 📜SupportedLiving.tsx
 ┃ ┃ ┣ 📜ThriftStore.tsx
 ┃ ┃ ┗ 📜Transportation.tsx
 ┃ ┣ 📂_components
 ┃ ┃ ┣ 📜AnchorSection.tsx
 ┃ ┃ ┣ 📜BackButton.tsx
 ┃ ┃ ┣ 📜Desktop.scss
 ┃ ┃ ┣ 📜Header.scss
 ┃ ┃ ┣ 📜IntroBar.module.scss
 ┃ ┃ ┣ 📜Mobile.scss
 ┃ ┃ ┗ 📜pageTree.ts
 ┃ ┣ 📜AboutUs.tsx
 ┃ ┣ 📜BoardofDirectors.tsx
 ┃ ┣ 📜DesktopNav.tsx
 ┃ ┣ 📜Footer.tsx
 ┃ ┣ 📜Header.tsx
 ┃ ┣ 📜Home.tsx
 ┃ ┣ 📜IntroBar.tsx
 ┃ ┣ 📜Jobs.tsx
 ┃ ┣ 📜Landing.tsx
 ┃ ┣ 📜MobileDrawer.tsx
 ┃ ┣ 📜PrivacyPolicy.tsx
 ┃ ┣ 📜SectionPanel.tsx
 ┃ ┣ 📜TermsPage.tsx
 ┃ ┗ 📜Title9Information.tsx
 ┣ 📂Layouts
 ┃ ┣ 📂appheader
 ┃ ┃ ┣ 📜CurrentDateTime.tsx
 ┃ ┃ ┣ 📜DashboardButton.tsx
 ┃ ┃ ┣ 📜dropdown-menu.tsx
 ┃ ┃ ┣ 📜dropdown.tsx
 ┃ ┃ ┣ 📜HomeButton.tsx
 ┃ ┃ ┣ 📜input.tsx
 ┃ ┃ ┣ 📜LogoutButton.tsx
 ┃ ┃ ┣ 📜ProfileButton.tsx
 ┃ ┃ ┣ 📜ScheduleButton.tsx
 ┃ ┃ ┣ 📜SettingsButton.tsx
 ┃ ┃ ┗ 📜SignInButton.tsx
 ┃ ┣ 📂header
 ┃ ┃ ┣ 📂notification
 ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┗ 📜index.tsx
 ┃ ┃ ┣ 📂theme-toggle
 ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┗ 📜index.tsx
 ┃ ┃ ┣ 📂user-info
 ┃ ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┃ ┗ 📜index.tsx
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂sidebar
 ┃ ┃ ┣ 📂data
 ┃ ┃ ┃ ┣ 📜index.ts
 ┃ ┃ ┃ ┗ 📜ui-elements-list.ts
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┣ 📜menu-item.tsx
 ┃ ┃ ┣ 📜sidebar-context.tsx
 ┃ ┃ ┗ 📜use-profile-id.ts
 ┃ ┗ 📜showcase-section.tsx
 ┣ 📂profile
 ┃ ┣ 📜AdminDelete.tsx
 ┃ ┣ 📜Avatar.tsx
 ┃ ┣ 📜AvatarUpload.tsx
 ┃ ┣ 📜DeleteAccount.tsx
 ┃ ┣ 📜EditProfileForm.tsx
 ┃ ┣ 📜FetchStepsClient.tsx
 ┃ ┣ 📜ManageSpecializations.tsx
 ┃ ┣ 📜ManualRoleEditor.tsx
 ┃ ┗ 📜ProfileCard.tsx
 ┣ 📂settings
 ┃ ┣ 📜catalog-settings.tsx
 ┃ ┣ 📜changecleaning.tsx
 ┃ ┣ 📜cms-settings.tsx
 ┃ ┣ 📜ModifyMembers.tsx
 ┃ ┣ 📜profile-settings.tsx
 ┃ ┣ 📜punch-card-maker-settings.tsx
 ┃ ┣ 📜RWbuissnes.tsx
 ┃ ┣ 📜SettingsToast.tsx
 ┃ ┗ 📜timesheet-calculator-settings.tsx
 ┣ 📂Tables
 ┃ ┣ 📂clients-list
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┣ 📂mood-check
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┣ 📂personal-wins
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┣ 📂top-channels
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┣ 📂top-products
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜skeleton.tsx
 ┃ ┣ 📜fetch.ts
 ┃ ┣ 📜icons.tsx
 ┃ ┗ 📜invoice-table.tsx
 ┣ 📂theme
 ┃ ┣ 📂_components
 ┃ ┃ ┣ 📜AccessibilityToggle.tsx
 ┃ ┃ ┣ 📜button.scss
 ┃ ┃ ┣ 📜theme.scss
 ┃ ┃ ┣ 📜ThemeColorMode.tsx
 ┃ ┃ ┣ 📜ThemePresetCard.tsx
 ┃ ┃ ┣ 📜ThemeSelector.tsx
 ┃ ┃ ┗ 📜ThemeToggle.tsx
 ┃ ┣ 📜accessibility.tsx
 ┃ ┗ 📜ThemeProvider.tsx
 ┣ 📂tools
 ┃ ┣ 📂_components
 ┃ ┃ ┣ 📜ActionButtons.tsx
 ┃ ┃ ┣ 📜BatchSettings.tsx
 ┃ ┃ ┣ 📜CardPreview.tsx
 ┃ ┃ ┣ 📜DataManagement.tsx
 ┃ ┃ ┣ 📜PDFGenerator.tsx
 ┃ ┃ ┣ 📜SimpleTimesheetExport.tsx
 ┃ ┃ ┣ 📜TemplateSelector.tsx
 ┃ ┃ ┣ 📜TimeInput.tsx
 ┃ ┃ ┣ 📜TimesheetRow.tsx
 ┃ ┃ ┣ 📜TimesheetTable.tsx
 ┃ ┃ ┣ 📜TotalsSection.tsx
 ┃ ┃ ┣ 📜WeekHeader.tsx
 ┃ ┃ ┗ 📜WeekTabs.tsx
 ┃ ┣ 📜PunchCardMaker.tsx
 ┃ ┣ 📜timesheet-calculator.tsx
 ┃ ┣ 📜tool-1.tsx
 ┃ ┗ 📜tool-2.tsx
 ┣ 📂tutorial
 ┃ ┣ 📜code-block.tsx
 ┃ ┣ 📜connect-supabase-steps.tsx
 ┃ ┣ 📜fetch-data-steps.tsx
 ┃ ┣ 📜sign-up-user-steps.tsx
 ┃ ┗ 📜tutorial-step.tsx
 ┣ 📂typography
 ┃ ┗ 📜inline-code.tsx
 ┣ 📂ui
 ┃ ┣ 📜accordion.tsx
 ┃ ┣ 📜alert-dialog.tsx
 ┃ ┣ 📜AuthCard.tsx
 ┃ ┣ 📜avatar.tsx
 ┃ ┣ 📜badge.tsx
 ┃ ┣ 📜button.tsx
 ┃ ┣ 📜card.tsx
 ┃ ┣ 📜chart.tsx
 ┃ ┣ 📜checkbox.tsx
 ┃ ┣ 📜DownloadPDF.tsx
 ┃ ┣ 📜ErrorMessage.tsx
 ┃ ┣ 📜form.tsx
 ┃ ┣ 📜input.tsx
 ┃ ┣ 📜label.tsx
 ┃ ┣ 📜OAuthButton.tsx
 ┃ ┣ 📜PunchCardGrid.tsx
 ┃ ┣ 📜scroll-area.tsx
 ┃ ┣ 📜separator.tsx
 ┃ ┣ 📜SessionBar.tsx
 ┃ ┣ 📜sheet.tsx
 ┃ ┣ 📜sidebar.tsx
 ┃ ┣ 📜SignInWithGoogle.tsx
 ┃ ┣ 📜skeleton.tsx
 ┃ ┣ 📜table.tsx
 ┃ ┣ 📜textarea.tsx
 ┃ ┗ 📜tooltip.tsx
 ┣ 📂ui-elements
 ┃ ┣ 📂alert
 ┃ ┃ ┣ 📜icons.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┗ 📜button.tsx
 ┣ 📜assignRandomJobs.ts
 ┣ 📜button.tsx
 ┣ 📜CleanTrack.tsx
 ┣ 📜ClientLayout.tsx
 ┣ 📜CookieConsent.tsx
 ┣ 📜deploy-button.tsx
 ┣ 📜DownloadPDF.tsx
 ┣ 📜env-var-warning.tsx
 ┣ 📜Export.tsx
 ┣ 📜fetchSchedule.ts
 ┣ 📜footer.tsx
 ┣ 📜form-message.tsx
 ┣ 📜header-auth.tsx
 ┣ 📜hero.tsx
 ┣ 📜hero2.tsx
 ┣ 📜ios-browser-detector.tsx
 ┣ 📜ios-status-bar-fix.tsx
 ┣ 📜logo.tsx
 ┣ 📜MetaThemeColor.tsx
 ┣ 📜nav.tsx
 ┣ 📜next-logo.tsx
 ┣ 📜period-picker.tsx
 ┣ 📜PunchCardGrid.tsx
 ┣ 📜RandomizerButton.tsx
 ┣ 📜ScheduleList.tsx
 ┣ 📜SignInForm.tsx
 ┣ 📜submit-button.tsx
 ┣ 📜supabase-logo.tsx
 ┣ 📜SwitchtoDarkMode.tsx
 ┣ 📜TeamMembersList.tsx
 ┣ 📜theme-color-handler.tsx
 ┣ 📜Toast.tsx
 ┣ 📜UniversalExportButton.tsx
 ┣ 📜WeatherWidget.tsx
 ┗ 📜WeekList.tsx
📦css
 ┗ 📜satoshi.css
📦fonts
 ┣ 📜Satoshi-Black.eot
 ┣ 📜Satoshi-Black.ttf
 ┣ 📜Satoshi-Black.woff
 ┣ 📜Satoshi-Black.woff2
 ┣ 📜Satoshi-BlackItalic.eot
 ┣ 📜Satoshi-BlackItalic.ttf
 ┣ 📜Satoshi-BlackItalic.woff
 ┣ 📜Satoshi-BlackItalic.woff2
 ┣ 📜Satoshi-Bold.eot
 ┣ 📜Satoshi-Bold.ttf
 ┣ 📜Satoshi-Bold.woff
 ┣ 📜Satoshi-Bold.woff2
 ┣ 📜Satoshi-BoldItalic.eot
 ┣ 📜Satoshi-BoldItalic.ttf
 ┣ 📜Satoshi-BoldItalic.woff
 ┣ 📜Satoshi-BoldItalic.woff2
 ┣ 📜Satoshi-Italic.eot
 ┣ 📜Satoshi-Italic.ttf
 ┣ 📜Satoshi-Italic.woff
 ┣ 📜Satoshi-Italic.woff2
 ┣ 📜Satoshi-Light.eot
 ┣ 📜Satoshi-Light.ttf
 ┣ 📜Satoshi-Light.woff
 ┣ 📜Satoshi-Light.woff2
 ┣ 📜Satoshi-LightItalic.eot
 ┣ 📜Satoshi-LightItalic.ttf
 ┣ 📜Satoshi-LightItalic.woff
 ┣ 📜Satoshi-LightItalic.woff2
 ┣ 📜Satoshi-Medium.eot
 ┣ 📜Satoshi-Medium.ttf
 ┣ 📜Satoshi-Medium.woff
 ┣ 📜Satoshi-Medium.woff2
 ┣ 📜Satoshi-MediumItalic.eot
 ┣ 📜Satoshi-MediumItalic.ttf
 ┣ 📜Satoshi-MediumItalic.woff
 ┣ 📜Satoshi-MediumItalic.woff2
 ┣ 📜Satoshi-Regular.eot
 ┣ 📜Satoshi-Regular.ttf
 ┣ 📜Satoshi-Regular.woff
 ┣ 📜Satoshi-Regular.woff2
 ┣ 📜Satoshi-Variable.eot
 ┣ 📜Satoshi-Variable.ttf
 ┣ 📜Satoshi-Variable.woff
 ┣ 📜Satoshi-Variable.woff2
 ┣ 📜Satoshi-VariableItalic.eot
 ┣ 📜Satoshi-VariableItalic.ttf
 ┣ 📜Satoshi-VariableItalic.woff
 ┗ 📜Satoshi-VariableItalic.woff2
📦hooks
 ┣ 📜calendar-fetchers.ts
 ┣ 📜calendar-utils.ts
 ┣ 📜use-click-outside.ts
 ┣ 📜use-mobile.ts
 ┣ 📜useAnalyticsConsent.ts
 ┣ 📜useAuth.ts
 ┣ 📜useCalendarEvents.ts
 ┣ 📜useCalendarModals.ts
 ┣ 📜useCalendarPermissions.ts
 ┣ 📜useCalendarRole.ts
 ┣ 📜useChat.ts
 ┣ 📜useChatDebugActions.ts
 ┣ 📜useChatSidebarUI.ts
 ┣ 📜useChatState.ts
 ┣ 📜useChatUI.ts
 ┣ 📜useConversationManager.ts
 ┣ 📜useConversations.ts
 ┣ 📜useDeleteConversation.ts
 ┣ 📜useDocuments.ts
 ┣ 📜useEventHandlers.ts
 ┣ 📜useHallMonitor.ts
 ┣ 📜useMessageManagement.ts
 ┣ 📜useMessages.ts
 ┣ 📜useOptimisticHours.ts
 ┣ 📜usePersistentTimesheetLogic.ts
 ┣ 📜usePublicFolders.ts
 ┣ 📜useRealtimeInsert.ts
 ┣ 📜useRealtimeNotifications.ts
 ┣ 📜useSelectConversation.ts
 ┣ 📜useSessionStorage.ts
 ┣ 📜useSharedMedia.ts
 ┣ 📜useTemplateStorage.ts
 ┣ 📜useTheme.ts
 ┣ 📜useTimesheetLogic.ts
 ┗ 📜useUserRole.ts
📦js
 ┗ 📜us-aea-en.js
📦lib
 ┣ 📂monitors
 ┃ ┣ 📜AdminHallMonitor.ts
 ┃ ┣ 📜ClientHallMonitor.ts
 ┃ ┣ 📜HallMonitorFactory.ts
 ┃ ┣ 📜JobCoachHallMonitor.ts
 ┃ ┗ 📜UserHallMonitor.ts
 ┣ 📂templates
 ┃ ┣ 📜desertTimesheetTemplate.ts
 ┃ ┗ 📜registerDesertTimesheet.ts
 ┣ 📜analytics.ts
 ┣ 📜apiCache.ts
 ┣ 📜CMSBillingTemplate.ts
 ┣ 📜cookieUtils.ts
 ┣ 📜DesertTimesheetTemplate.ts
 ┣ 📜dynamicFontManager.ts
 ┣ 📜exportUtils.ts
 ┣ 📜format-message-time.ts
 ┣ 📜format-number.ts
 ┣ 📜getUserProfile.ts
 ┣ 📜getUserProfileById.ts
 ┣ 📜members.ts
 ┣ 📜navTree.ts
 ┣ 📜notifications.ts
 ┣ 📜robustPDFGenerator.ts
 ┣ 📜supabaseClient.ts
 ┣ 📜toolsConfig.ts
 ┣ 📜useAvatarUpload.ts
 ┣ 📜useLoginSession.ts
 ┣ 📜useThemeCookie.ts
 ┗ 📜utils.ts
📦public
 ┣ 📂images
 ┃ ┣ 📂brand
 ┃ ┃ ┣ 📜brand-01.svg
 ┃ ┃ ┣ 📜brand-02.svg
 ┃ ┃ ┣ 📜brand-03.svg
 ┃ ┃ ┣ 📜brand-04.svg
 ┃ ┃ ┣ 📜brand-05.svg
 ┃ ┃ ┣ 📜brand-06.svg
 ┃ ┃ ┣ 📜brand-07.svg
 ┃ ┃ ┣ 📜brand-08.svg
 ┃ ┃ ┣ 📜brand-09.svg
 ┃ ┃ ┣ 📜brand-10.svg
 ┃ ┃ ┣ 📜brand-11.svg
 ┃ ┃ ┣ 📜brand-12.svg
 ┃ ┃ ┣ 📜brand-13.svg
 ┃ ┃ ┣ 📜brand-14.svg
 ┃ ┃ ┣ 📜brand-15.svg
 ┃ ┃ ┣ 📜brand-16.svg
 ┃ ┃ ┣ 📜brand-17.svg
 ┃ ┃ ┣ 📜brand-18.svg
 ┃ ┃ ┣ 📜brand-19.svg
 ┃ ┃ ┗ 📜brand-20.svg
 ┃ ┣ 📂cards
 ┃ ┃ ┣ 📜cards-01.png
 ┃ ┃ ┣ 📜cards-02.png
 ┃ ┃ ┣ 📜cards-03.png
 ┃ ┃ ┣ 📜cards-04.png
 ┃ ┃ ┣ 📜cards-05.png
 ┃ ┃ ┗ 📜cards-06.png
 ┃ ┣ 📂carousel
 ┃ ┃ ┣ 📜carousel-01.jpg
 ┃ ┃ ┣ 📜carousel-02.jpg
 ┃ ┃ ┗ 📜carousel-03.jpg
 ┃ ┣ 📂country
 ┃ ┃ ┣ 📜country-01.svg
 ┃ ┃ ┣ 📜country-02.svg
 ┃ ┃ ┣ 📜country-03.svg
 ┃ ┃ ┣ 📜country-04.svg
 ┃ ┃ ┣ 📜country-05.svg
 ┃ ┃ ┗ 📜country-06.svg
 ┃ ┣ 📂cover
 ┃ ┃ ┣ 📜cover-01.png
 ┃ ┃ ┣ 📜cover-02.jpg
 ┃ ┃ ┣ 📜cover-03.jpg
 ┃ ┃ ┣ 📜cover-04.jpg
 ┃ ┃ ┗ 📜cover-05.jpg
 ┃ ┣ 📂grids
 ┃ ┃ ┣ 📜grid-01.svg
 ┃ ┃ ┗ 📜grid-02.svg
 ┃ ┣ 📂home
 ┃ ┃ ┣ 📜Artists on the Edge.jpg
 ┃ ┃ ┣ 📜Autism Day Camp.png
 ┃ ┃ ┣ 📜Board of Directors greg-boske.jpg
 ┃ ┃ ┣ 📜Board of Directors lady 2.jpg
 ┃ ┃ ┣ 📜Board of DirectorsLady.jpg
 ┃ ┃ ┣ 📜Board of Directorslady3.jpg
 ┃ ┃ ┣ 📜Businesses_rows.csv
 ┃ ┃ ┣ 📜carf-accreditation-standards.webp
 ┃ ┃ ┣ 📜chamber.jpg
 ┃ ┃ ┣ 📜Commission for the Accreditation.jpg
 ┃ ┃ ┣ 📜DART Thrift Store.jpg
 ┃ ┃ ┣ 📜dartboard.png
 ┃ ┃ ┣ 📜dartboard.svg
 ┃ ┃ ┣ 📜dartlogo.svg
 ┃ ┃ ┣ 📜dartlogowhite.svg
 ┃ ┃ ┣ 📜Early Childhood Services.jpg
 ┃ ┃ ┣ 📜Employment Services.jpg
 ┃ ┃ ┣ 📜founders.png
 ┃ ┃ ┣ 📜profiles_rows.csv
 ┃ ┃ ┣ 📜Secure Document Shredding.jpg
 ┃ ┃ ┣ 📜sponsor1.jpg
 ┃ ┃ ┣ 📜sponsor1.png
 ┃ ┃ ┣ 📜sponsor2.png
 ┃ ┃ ┣ 📜sponsor3.jpg
 ┃ ┃ ┣ 📜sponsor3.png
 ┃ ┃ ┣ 📜Supported Living Services.jpg
 ┃ ┃ ┗ 📜Transportation.jpg
 ┃ ┣ 📂icon
 ┃ ┃ ┣ 📜asesablity.svg
 ┃ ┃ ┣ 📜icon-arrow-down.svg
 ┃ ┃ ┣ 📜icon-calendar.svg
 ┃ ┃ ┣ 📜icon-copy-alt.svg
 ┃ ┃ ┣ 📜icon-moon.svg
 ┃ ┃ ┗ 📜icon-sun.svg
 ┃ ┣ 📂illustration
 ┃ ┃ ┣ 📜illustration-01.svg
 ┃ ┃ ┣ 📜illustration-02.svg
 ┃ ┃ ┣ 📜illustration-03.svg
 ┃ ┃ ┗ 📜illustration-04.svg
 ┃ ┣ 📂logo
 ┃ ┃ ┣ 📜logo-dark.svg
 ┃ ┃ ┣ 📜logo-icon.svg
 ┃ ┃ ┗ 📜logo.svg
 ┃ ┣ 📂product
 ┃ ┃ ┣ 📜product-01.png
 ┃ ┃ ┣ 📜product-02.png
 ┃ ┃ ┣ 📜product-03.png
 ┃ ┃ ┣ 📜product-04.png
 ┃ ┃ ┗ 📜product-thumb.png
 ┃ ┣ 📂task
 ┃ ┃ ┗ 📜task-01.jpg
 ┃ ┣ 📂team
 ┃ ┃ ┣ 📜team-01.png
 ┃ ┃ ┣ 📜team-02.png
 ┃ ┃ ┣ 📜team-03.png
 ┃ ┃ ┣ 📜team-04.png
 ┃ ┃ ┣ 📜team-05.png
 ┃ ┃ ┣ 📜team-06.png
 ┃ ┃ ┣ 📜team-07.png
 ┃ ┃ ┗ 📜team-08.png
 ┃ ┣ 📂todo
 ┃ ┃ ┣ 📜dribble.svg
 ┃ ┃ ┣ 📜linkdin.svg
 ┃ ┃ ┗ 📜uideck.svg
 ┃ ┣ 📂user
 ┃ ┃ ┣ 📜user-01.png
 ┃ ┃ ┣ 📜user-02.png
 ┃ ┃ ┣ 📜user-03.png
 ┃ ┃ ┣ 📜user-04.png
 ┃ ┃ ┣ 📜user-05.png
 ┃ ┃ ┣ 📜user-06.png
 ┃ ┃ ┣ 📜user-07.png
 ┃ ┃ ┣ 📜user-08.png
 ┃ ┃ ┣ 📜user-09.png
 ┃ ┃ ┣ 📜user-10.png
 ┃ ┃ ┣ 📜user-11.png
 ┃ ┃ ┣ 📜user-12.png
 ┃ ┃ ┣ 📜user-13.png
 ┃ ┃ ┣ 📜user-14.png
 ┃ ┃ ┣ 📜user-15.png
 ┃ ┃ ┣ 📜user-16.png
 ┃ ┃ ┣ 📜user-17.png
 ┃ ┃ ┣ 📜user-18.png
 ┃ ┃ ┣ 📜user-19.png
 ┃ ┃ ┣ 📜user-20.png
 ┃ ┃ ┣ 📜user-21.png
 ┃ ┃ ┣ 📜user-22.png
 ┃ ┃ ┣ 📜user-23.png
 ┃ ┃ ┣ 📜user-24.png
 ┃ ┃ ┣ 📜user-25.png
 ┃ ┃ ┣ 📜user-26.png
 ┃ ┃ ┣ 📜user-27.png
 ┃ ┃ ┣ 📜user-28.png
 ┃ ┃ ┣ 📜user-29.png
 ┃ ┃ ┗ 📜user-30.png
 ┃ ┣ 📜1.png
 ┃ ┣ 📜2.png
 ┃ ┣ 📜3.png
 ┃ ┣ 📜4.png
 ┃ ┣ 📜5.png
 ┃ ┣ 📜admin.png
 ┃ ┣ 📜best-value-banner.png
 ┃ ┣ 📜client.png
 ┃ ┣ 📜cms.png
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜ios-fix.js
 ┃ ┣ 📜jobcoach.png
 ┃ ┣ 📜punch-card-maker.png
 ┃ ┗ 📜SLS.png
 ┣ 📜12-Month calendar.xlsx
 ┗ 📜404.svg
📦services
 ┣ 📜advancedMessageServices.ts
 ┣ 📜campaigns.service.ts
 ┣ 📜costs.service.ts
 ┣ 📜device.service.ts
 ┣ 📜messageLoadingService.ts
 ┣ 📜messageServices.ts
 ┣ 📜payment.service.ts
 ┣ 📜profit.service.ts
 ┗ 📜visitors.service.ts
📦style
 ┣ 📜home.css
 ┣ 📜nav.css
 ┣ 📜navigation.css
 ┣ 📜styles.css
 ┣ 📜switch-to-dark-mode.css
 ┣ 📜timesheet-calculator.css
 ┗ 📜TSC.css
📦themes
 ┣ 📜default.ts
 ┣ 📜fonts.ts
 ┣ 📜index.ts
 ┣ 📜monochrome.ts
 ┣ 📜sharp.ts
 ┣ 📜utils.ts
 ┗ 📜vintage.ts
📦types
 ┣ 📜api.ts
 ┣ 📜icon-props.ts
 ┣ 📜jsvectormap.d.ts
 ┣ 📜monitors.ts
 ┣ 📜set-state-action-type.ts
 ┣ 📜supabase.ts
 ┣ 📜theme.ts
 ┗ 📜timesheet.ts
📦utils
 ┣ 📂supabase
 ┃ ┣ 📜check-env-vars.ts
 ┃ ┣ 📜client.ts
 ┃ ┣ 📜index.ts
 ┃ ┣ 📜middleware.ts
 ┃ ┗ 📜server.ts
 ┣ 📜chatPageUtils.ts
 ┣ 📜create_composite_image.ts
 ┣ 📜generate_individual_punchcards.ts
 ┣ 📜pdfGenerator.ts
 ┣ 📜theme-color.ts
 ┣ 📜themeTransitions.ts
 ┣ 📜timeframe-extractor.ts
 ┣ 📜timesheetUtils.ts
 ┗ 📜utils.ts
components.json
middleware.ts
next.config.ts
package-lock.json
package.json
postcss.config.js
README.md
tailwind.config.ts
tsconfig.json
tsconfig.json
