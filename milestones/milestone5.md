# Milestone 5

This document should be completed and submitted during **Unit 9** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [X] Deploy your project on Railway (Render)
  - [X] In `readme.md`, add the link to your deployed project
- [X] Update the status of issues in your project board as you complete them
- [X] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of their title
  - [X] Under each feature you have completed, **include a GIF** showing feature functionality
- [X] In this document, complete the **Reflection** section below
- [X] 🚩🚩🚩**Complete the Final Project Feature Checklist section below**, detailing each feature you completed in the project (ONLY include features you implemented, not features you planned)
- [X] 🚩🚩🚩**Record a GIF showing a complete run-through of your app** that displays all the components included in the **Final Project Feature Checklist** below
  - [X] Include this GIF in the **Final Demo GIF** section below

## Final Project Feature Checklist

Complete the checklist below detailing each baseline, custom, and stretch feature you completed in your project. This checklist will help graders look for each feature in the GIF you submit.

### Baseline Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [X] The project includes an Express backend app and a React frontend app
- [X] The project includes these backend-specific features:
  - [X] At least one of each of the following database relationship in Postgres
    - [X] one-to-many
    - [X] many-to-many with a join table
  - [X] A well-designed RESTful API
    - [X] The API can respond to at least one of each type of request: GET, POST, PATCH, and DELETE
    - [X] Routes follow proper naming conventions
  - [X] The ability to reset the database to its default state
- [X] The project includes these frontend-specific features:
  - [X] At least one redirection
  - [X] At least one interaction that the user can initiate and complete on the same page without navigating to a new page
  - [X] Dynamic frontend routes created with React Router
  - [X] Hierarchically designed React components
    - [X] Components broken down into categories, including Page and Component types
    - [X] Corresponding container components and presenter components as appropriate
- [X] The project includes dynamic routes for both frontend and backend apps
- [X] The project is deployed on Railway (Render) with all pages and features working

### Custom Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [X] The project gracefully handles errors
- [ ] The project includes a one-to-one database relationship
- [X] The project includes a slide-out pane or modal as appropriate for your use case
- [X] The project includes a unique field within the join table
- [X] The project includes a custom non-RESTful route with corresponding controller actions
- [X] The project allows filtering and/or sorting as appropriate for your use case
- [X] Data is automatically generated in response to a certain event or user action. Examples include generating a default inventory for a new user starting a game or creating a starter set of tasks for a user creating a new task app account
- [X] Data submitted via a POST or PATCH request is validated before the database is updated

### Stretch Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [X] A subset of pages require the user to log in before accessing the content
  - [X] Users can log in and log out via GitHub OAuth with Passport.js
- [X] Restrict available user options dynamically, such as restricting available purchases based on a user's currency
- [ ] Show a spinner while a page or page element is loading
- [ ] Disable buttons and inputs during the form submission process
- [ ] Disable buttons after they have been clicked
- [ ] Users can upload images to the app and have them be stored on a cloud service
- [X] 🍞 [Toast messages](https://www.patternfly.org/v3/pattern-library/communication/toast-notifications/index.html) deliver simple feedback in response to user events

## Final Demo GIF

[Promptify YouTube Demo](https://youtu.be/DaxxJaa_lGM)
![Milestone 5](https://i.ibb.co/fSRnfBR/milestone-5.gif)

## Reflection

### 1. What went well during this unit?

This is was mostly fixing bugs that popped up and adding final touches. I was able to fix all deployment bugs and get a stable release.

### 2. What were some challenges your group faced in this unit?

I faced some routing issues after deploying and ran into some confusion with which urls in .env to replace my hard coded urls with. I realized I was still using localhost in some places, and that I was still separating the backend and frontend urls. Fixing those issues allowed for a successful deployment.

### 3. What were some of the highlights or achievements that you are most proud of in this project?

Being able to use OAuth was a milestone I was eager to reach, the way it was explained and demonstrated made it infinitely easier to understand and implement. I also like the overall design and functionality of the app, I'm proud that I was able to get it all done while even allowing it to grow beyond the initial scope. I am especially proud of how interactive it is and how it has many features that are not just static.

### 4. Reflecting on your web development journey so far, how have you grown since the beginning of the course?

I am %100 more comfortable working with full-stack web apps, and with PostgreSQL. This was my first time deploying a full-stack app, and I feel like it's given me good grounds to build on.

### 5. Looking ahead, what are your goals related to web development, and what steps do you plan to take to achieve them?

I'm currently looking to begin my career and am looking for both internships and full-time positions. To help with this, I am continuing to build up my portfolio to display my skills and to revamp my resume. While I'm doing this, I am also enhancing my skills by working on more projects and learning other technologies such as Java.
