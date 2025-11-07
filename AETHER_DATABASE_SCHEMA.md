# Aether Core Orchestrator Database Schema

## Overview

The Aether Core Orchestrator uses a PostgreSQL database to manage agents, tasks, credentials, assets, and analytics. This document details the database schema and table relationships.

## Database Tables

### 1. Agents Table

Stores information about all agents in the Aether network.

```sql
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'inactive',
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique identifier for the agent
- `name`: Human-readable name of the agent (unique)
- `type`: Agent type ('youtube', 'telegram', 'music', 'orchestrator')
- `status`: Current status ('active', 'inactive', 'error')
- `config`: JSON configuration data for the agent
- `created_at`: Timestamp when the agent was created
- `updated_at`: Timestamp when the agent was last updated

### 2. Tasks Table

Tracks all content creation and processing tasks.

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  payload JSONB,
  result JSONB,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique identifier for the task
- `agent_id`: Reference to the agent responsible for this task
- `task_type`: Type of task ('create_video', etc.)
- `status`: Current status ('pending', 'in_progress', 'completed', 'failed')
- `priority`: Task priority (higher numbers = higher priority)
- `payload`: JSON data containing task parameters
- `result`: JSON data containing task results
- `scheduled_at`: When the task is scheduled to run
- `started_at`: When the task started processing
- `completed_at`: When the task completed
- `created_at`: Timestamp when the task was created
- `updated_at`: Timestamp when the task was last updated

### 3. Credentials Table

Securely stores API credentials and authentication tokens.

```sql
CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  platform VARCHAR(50) NOT NULL,
  credential_key VARCHAR(100) NOT NULL,
  credential_value TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique identifier for the credential
- `agent_id`: Reference to the agent that owns this credential
- `platform`: Platform the credential is for ('youtube', 'telegram', etc.)
- `credential_key`: Type of credential ('access_token', 'api_key', etc.)
- `credential_value`: Encrypted credential value
- `expires_at`: When the credential expires (if applicable)
- `created_at`: Timestamp when the credential was created
- `updated_at`: Timestamp when the credential was last updated

### 4. Assets Table

Manages digital assets used by the Aether network.

```sql
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  path VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique identifier for the asset
- `name`: Human-readable name of the asset
- `type`: Asset type ('video', 'audio', 'image', 'script', etc.)
- `path`: File path or URL to the asset
- `metadata`: JSON data containing asset metadata
- `created_at`: Timestamp when the asset was created
- `updated_at`: Timestamp when the asset was last updated

### 5. Analytics Table

Stores performance metrics and analytics data.

```sql
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC,
  metadata JSONB,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique identifier for the metric
- `agent_id`: Reference to the agent this metric belongs to
- `metric_name`: Name of the metric ('videos_created', 'messages_sent', etc.)
- `value`: Numeric value of the metric
- `metadata`: JSON data containing additional metric information
- `recorded_at`: Timestamp when the metric was recorded

## Indexes

The database includes several indexes for improved query performance:

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_credentials_agent_id ON credentials(agent_id);
CREATE INDEX IF NOT EXISTS idx_credentials_platform ON credentials(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_agent_id ON analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at);
```

## Relationships

The database schema defines the following relationships:

1. **Agents → Tasks**: One-to-many (one agent can have many tasks)
2. **Agents → Credentials**: One-to-many (one agent can have many credentials)
3. **Agents → Analytics**: One-to-many (one agent can have many metrics)

## Security Considerations

### Credential Encryption
All credentials stored in the `credentials` table should be encrypted at rest using industry-standard encryption algorithms. The `credential_value` field stores encrypted data.

### Access Control
Database access should be restricted to:
- The Orchestrator service
- Authorized administrative tools
- Backup and monitoring systems

### Audit Logging
All database operations should be logged for security auditing:
- Creation of new agents or credentials
- Modification of existing records
- Deletion of records

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Hourly incremental backups
- Off-site storage of backup copies
- Regular backup restoration testing

### Recovery Procedures
- Point-in-time recovery for data corruption
- Full database restoration for disaster recovery
- Credential re-issuance after restoration

## Performance Optimization

### Connection Pooling
Use connection pooling to manage database connections efficiently:
- Minimum pool size: 5 connections
- Maximum pool size: 20 connections
- Connection timeout: 30 seconds

### Query Optimization
- Use prepared statements for repeated queries
- Limit result set sizes for large tables
- Implement pagination for large data sets

## Maintenance

### Regular Maintenance Tasks
- Index rebuilding weekly
- Statistics updates daily
- Log file rotation
- Database vacuuming (for PostgreSQL)

### Monitoring
- Query performance monitoring
- Connection pool utilization
- Disk space monitoring
- Error rate tracking

## Scalability Considerations

### Horizontal Scaling
For large-scale deployments:
- Database read replicas for analytics queries
- Partitioning of large tables (e.g., analytics by date)
- Caching of frequently accessed data

### Vertical Scaling
- Monitor resource utilization
- Upgrade hardware as needed
- Optimize queries for better performance

## Conclusion

The Aether database schema provides a robust foundation for managing the content and revenue network. With proper security measures, backup procedures, and performance optimization, it can scale to support a large network of autonomous agents creating and distributing content across multiple platforms.