---
id: triggers-notifications
title: Triggers & Notifications
sidebar_label: Triggers / Listen
sidebar_position: 2
description: Utilize PostgreSQL Triggers and Listen/Notify for real-time reactivity.
---

# Database Triggers & Notifications

![Triggers Demo](/img/placeholder-db-triggers.png)

Jet Admin uniquely leverages advanced PostgreSQL features like Triggers and `LISTEN/NOTIFY` to bring real-time reactivity to your internal tools.

## PostgreSQL Triggers

You can define database triggers directly from the UI to automatically execute functions when a row is `INSERTED`, `UPDATED`, or `DELETED`.

1. Go to **Database** > **Triggers**.
2. Select the target table and the event.
3. Provide the PL/pgSQL function to execute.

## Listen / Notify

Jet Admin's backend can subscribe to database notifications using PostgreSQL's `LISTEN` command. This enables your widgets (like tables or charts) to update automatically the moment underlying data changes, without needing to repeatedly poll the database.

### API Reference Stub
- `GET /api/v1/tenants/:tenantID/databases/:dbID/triggers` - List triggers
- `GET /api/v1/tenants/:tenantID/databases/:dbID/notifications` - List active listeners
