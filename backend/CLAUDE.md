# AIVA Backend

## Project Overview

Rails 7.1 API-only application. Ruby 3.2.3, SQLite3 database.

## Structure

- API controllers live in `app/controllers/api/v1/`
- All routes are namespaced under `/api/v1`
- Time slots are nested under organizations: `/api/v1/organizations/:organization_id/time_slots`

## Models & Associations

- `Organization` has_many `TimeSlot` (dependent: destroy)
- `Customer` has_many `ServiceRequest` (dependent: destroy)
- `TimeSlot` belongs_to `Organization`
- `ServiceRequest` belongs_to `Customer`

## Commands

- `rails server` — start dev server on port 3000
- `rails db:migrate` — run pending migrations
- `rails routes` — list all routes
- `rails console` — open Rails console

## Conventions

- Controllers return JSON responses
- RESTful resource routing
- Standard Rails file naming (snake_case)
