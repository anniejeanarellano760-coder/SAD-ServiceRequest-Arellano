ICT Service Request Management System

A CRUD-based web application that lets authorized ICT staff and users record,
search, filter, and monitor technical support requests — built for
**Laboratory Exercise 3 — Systems Analysis and Design (SAD)**.

**Front End:** HTML, CSS, JavaScript (vanilla, no framework)
**Back End:** Supabase (PostgreSQL database + Authentication)
**Deployment:** GitHub Pages

## Submission

Student: Annie Jean Arellano
Section: BSIT 3A
GitHub Repository:    https://github.com/<username>/SAD-ServiceRequest-<Lastname>
Live System:          https://<username>.github.io/SAD-ServiceRequest-<Lastname>/

1. Problem Statement

The university's ICT office currently receives technical concerns through
disconnected channels such as verbal requests, text messages, and social media
with no central record. As a result, requests are sometimes forgotten,
duplicated, or left unmonitored, delaying resolution and frustrating
requesters. The ICT office needs a simple, centralized web-based system
where authorized users can submit, track, search, and update the status of
technical support requests, so every concern is visible, accountable, and
traceable from submission to completion.


2. Actors

**Primary Actor: System User / ICT Personnel**

Any authenticated staff member who logs in to submit new service requests
and manage (view, search, filter, update, delete) requests. All logged-in
users can view every request, but can only edit or delete requests they
personally created — enforced through Supabase Row Level Security (RLS)
policies keyed to `user_id`.

3. Use Case Diagram
  <img width="365" height="521" alt="Screenshot 2026-09-08 205026" src="https://github.com/user-attachments/assets/cebae8c1-3de3-4549-bad2-08de2531c0b3" />

4. Entity-Relationship Diagram (ERD)

<img width="667" height="480" alt="Screenshot 2026-09-08 104226" src="https://github.com/user-attachments/assets/962608f3-2b03-449d-acfd-c9d5117d4d9d" />


One user can create many service requests (1-to-many). Each service request
belongs to exactly one creating user, captured in the `user_id` foreign key.

5. Requirements Traceability Matrix

| Req. ID | Requirement              | System Feature      | Test  |
|---------|--------------------------|---------------------|-------|
| FR-01   | User can log in          | Login Page          | TC-01 |
| FR-02   | User can create request  | Request Form        | TC-02 |
| FR-03   | User can view requests   | Request Table       | TC-03 |
| FR-04   | User can update request  | Edit Function       | TC-04 |
| FR-05   | User can delete request  | Delete Function     | TC-05 |
| FR-06   | User can search          | Search Function     | TC-06 |
| FR-07   | User can filter          | Filter Function     | TC-07 |
| FR-08   | System displays summaries| Dashboard           | TC-08 |

6. Testing Results

| Test ID| Test Scenario           | Expected Result                        | Pass/Fail|
|--------|-------------------------|----------------------------------------|-------|
| TC-01 | Login using valid account| Dashboard appears                      | Pass  |
| TC-02 | Submit valid request     | Request saved                          | Pass  |   
| TC-03 | Display requests         | Existing recordsappear                 | Pass  |       
| TC-04 | Modify request           | Changes saved                          | Pass  |
| TC-05 | Delete request           | Confirmation show and record is removed| Pass  |        
| TC-06 | Search requester         | Matching records displayed             | Pass  |         
| TC-07 | Filter Pending requests  | Only Pending records displayed         | Pass  |           
| TC-08 | Open deployed URL        | Application loads online               | Pass  |            


