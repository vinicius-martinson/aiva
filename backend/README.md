# AIVA Backend

Rails 7.1 API-only backend for AIVA.

## Requirements

- Ruby 3.2.3
- SQLite3

## Setup

```bash
bundle install
rails db:create db:migrate
```

## Running

```bash
rails server
```

Server starts at `http://localhost:3000`.

## API Endpoints

All endpoints are under `/api/v1`.

| Resource | Method | Path |
|---|---|---|
| Customers | GET | `/api/v1/customers` |
| Customers | GET | `/api/v1/customers/:id` |
| Customers | POST | `/api/v1/customers` |
| Customers | PATCH | `/api/v1/customers/:id` |
| Customers | DELETE | `/api/v1/customers/:id` |
| Organizations | GET | `/api/v1/organizations` |
| Organizations | GET | `/api/v1/organizations/:id` |
| Organizations | POST | `/api/v1/organizations` |
| Organizations | PATCH | `/api/v1/organizations/:id` |
| Organizations | DELETE | `/api/v1/organizations/:id` |
| Time Slots | GET | `/api/v1/organizations/:organization_id/time_slots` |
| Time Slots | GET | `/api/v1/organizations/:organization_id/time_slots/:id` |
| Time Slots | POST | `/api/v1/organizations/:organization_id/time_slots` |
| Time Slots | PATCH | `/api/v1/organizations/:organization_id/time_slots/:id` |
| Time Slots | DELETE | `/api/v1/organizations/:organization_id/time_slots/:id` |
| Service Requests | GET | `/api/v1/service_requests` |
| Service Requests | GET | `/api/v1/service_requests/:id` |
| Service Requests | POST | `/api/v1/service_requests` |
| Service Requests | PATCH | `/api/v1/service_requests/:id` |
| Service Requests | DELETE | `/api/v1/service_requests/:id` |

## Models

- **Organization** has many **TimeSlots**
- **Customer** has many **ServiceRequests**
