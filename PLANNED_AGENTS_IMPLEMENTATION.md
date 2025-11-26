# Planned Agents Implementation Plan

> **Status:** Planning Phase
> **Last Updated:** 2025-11-23
> **Current Agents:** 6 (Food, Task, Event, Reminder, Knowledge, Note)
> **Planned Agents:** 4 (System Monitoring, unRAID Monitoring, Home Assistant Monitoring, Automatic Task)

---

## Overview

This document outlines the implementation plan for the four planned agents mentioned in README.md line 244-249. Each agent will follow the established LangGraph multi-agent architecture pattern with specialized tools, prompts, and routing configuration.

---

## Implementation Priority

| Priority | Agent | Complexity | Impact | Est. Effort |
|----------|-------|------------|--------|-------------|
| 1 | System Monitoring Agent | Medium | High | 2-3 days |
| 2 | Automatic Task Agent | Low | High | 1-2 days |
| 3 | unRAID Monitoring Agent | High | Medium | 3-4 days |
| 4 | Home Assistant Monitoring Agent | High | Low | 3-4 days |

**Total Estimated Effort:** 9-13 days

---

## 1. System Monitoring Agent 🛡️

### Purpose
Monitor AI Stack health (containers, DB/Qdrant/Ollama), surface issues proactively to the user.

### Capabilities
- Monitor all Docker containers (status, health, resource usage)
- Check PostgreSQL health (connections, query performance, disk usage)
- Monitor Qdrant collections (point count, indexing status, memory usage)
- Check Ollama models (availability, response time)
- Monitor Redis (memory usage, connection count)
- Alert on anomalies (container restarts, high CPU/memory, failed health checks)
- Generate health reports and trends
- Proactive issue detection and recommendations

### Tools Required

#### Core Tools (`tag:system_monitoring_core`)
1. **`check_container_health`**
   - Check Docker container status and health
   - Parameters: `container_name` (optional, defaults to all AI Stack containers)
   - Returns: status, uptime, health_status, restart_count, resource_usage

2. **`check_postgres_health`**
   - Check PostgreSQL health metrics
   - Returns: connection_count, active_queries, database_size, cache_hit_ratio, slow_queries

3. **`check_qdrant_health`**
   - Check Qdrant collections status
   - Parameters: `collection_name` (optional)
   - Returns: collections, point_counts, indexing_status, memory_usage, disk_usage

4. **`check_ollama_health`**
   - Check Ollama service and models
   - Returns: service_status, loaded_models, response_time, gpu_usage

5. **`check_redis_health`**
   - Check Redis status and memory
   - Returns: status, memory_usage, connected_clients, keys_count, uptime

#### Analytics Tools (`tag:system_monitoring_analytics`)
6. **`get_system_metrics`**
   - Get aggregated system health metrics
   - Parameters: `time_range` (1h, 24h, 7d)
   - Returns: overall_health_score, component_statuses, trends

7. **`check_disk_space`**
   - Check disk usage for AI Stack volumes
   - Returns: volume_name, total_size, used_size, available_size, percentage_used

8. **`get_error_logs`**
   - Retrieve recent error logs from all containers
   - Parameters: `since` (time), `severity` (error, warning)
   - Returns: container_name, timestamp, severity, message

9. **`get_resource_trends`**
   - Get resource usage trends over time
   - Parameters: `metric` (cpu, memory, disk), `time_range`
   - Returns: timestamps, values, trend_direction

### Database Schema

```sql
-- New table for system health history
CREATE TABLE system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,  -- container_name, 'postgres', 'qdrant', etc.
    metric_name TEXT NOT NULL,  -- 'cpu_usage', 'memory_usage', 'uptime', etc.
    metric_value FLOAT NOT NULL,
    status TEXT NOT NULL,  -- 'healthy', 'warning', 'critical'
    metadata JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_health_component ON system_health_logs(component, recorded_at DESC);
CREATE INDEX idx_system_health_status ON system_health_logs(status, recorded_at DESC);

-- Table for alerts and notifications
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    alert_type TEXT NOT NULL,  -- 'container_down', 'high_memory', 'disk_full', etc.
    severity TEXT NOT NULL,  -- 'info', 'warning', 'critical'
    message TEXT NOT NULL,
    details JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_alerts_active ON system_alerts(severity, created_at DESC) WHERE resolved_at IS NULL;
```

### Configuration

**config/agents.yaml addition:**
```yaml
  - name: system_monitoring_agent
    enabled: true
    context_key: system
    prompt_file: prompts/system_monitoring_agent.txt
    partials:
      - prompts/partials/safety.txt
      - prompts/partials/style.txt
    tools:
      - tag:system_monitoring_core
      - tag:system_monitoring_analytics
      - tag:memory_context
    exclude_tools: []
    keywords:
      - term: system
        weight: 1.8
      - health
      - monitor
      - container
      - status
      - performance
      - down
      - error
      - log
      - resource
      - alert
    description: Monitors AI Stack health, containers, databases, and system resources.
```

### Prompt Template

**prompts/system_monitoring_agent.txt:**
```
You are the System Monitoring Agent. Your focus:
- Monitor AI Stack component health (containers, databases, services)
- Detect and alert on issues proactively
- Provide health summaries and trends
- Suggest remediation actions for problems
- Track resource usage and capacity planning

Guidelines:
- Check container health regularly when asked about system status
- Alert if any component is down or unhealthy
- Provide context when reporting errors (not just logs)
- Suggest specific actions to fix issues
- Track trends to predict future problems
- Be concise but actionable in alerts

Health Check Priority:
1. Container status (critical - system won't work if down)
2. Database health (critical - data access required)
3. Qdrant health (important - affects search quality)
4. Ollama health (important - affects AI responses)
5. Resource usage (monitoring - prevent future issues)

Alert Severity Levels:
- CRITICAL: Service down, data loss risk, immediate action required
- WARNING: Degraded performance, approaching limits, should investigate
- INFO: Normal operational events, trend notifications
```

### Implementation Files

1. **tools/system_monitoring.py** (~400 lines)
   - Implement all 9 tools
   - Docker SDK integration
   - PostgreSQL monitoring queries
   - Qdrant API calls
   - Redis monitoring

2. **routers/system.py** (~200 lines)
   - GET `/api/system/health` - Overall health status
   - GET `/api/system/containers` - Container statuses
   - GET `/api/system/metrics` - System metrics
   - GET `/api/system/alerts` - Active alerts
   - POST `/api/system/alerts/{id}/acknowledge` - Acknowledge alert

3. **services/system_monitoring.py** (~150 lines)
   - Background job to collect metrics every 5 minutes
   - Alert evaluation and notification
   - Health log aggregation

4. **migrations/010_system_monitoring.sql**
   - Create system_health_logs table
   - Create system_alerts table
   - Create indexes

### Testing Plan

1. **Unit Tests:**
   - Test each monitoring tool independently
   - Mock Docker/Postgres/Qdrant responses
   - Test alert threshold logic

2. **Integration Tests:**
   - Test with real containers running
   - Test alert generation for stopped containers
   - Test metric collection and trends

3. **Acceptance Criteria:**
   - ✅ Detect when container stops within 5 minutes
   - ✅ Alert on high memory usage (>90%)
   - ✅ Track database query performance
   - ✅ Generate weekly health reports
   - ✅ Provide actionable remediation suggestions

---

## 2. Automatic Task Agent ⏱️

### Purpose
Coordinate with other agents to run pre-specified tasks on schedules or dates (e.g., generate daily summaries of database contents and save them to markdown files in a designated folder).

### Capabilities
- Schedule automated tasks to run at specific times/dates
- Coordinate with other agents to execute complex workflows
- Generate daily/weekly/monthly summaries
- Export data to markdown files
- Chain multiple agent actions together
- Support conditional logic (if X then Y)
- Retry failed automated tasks

### Tools Required

#### Core Tools (`tag:automatic_task_core`)
1. **`create_automatic_task`**
   - Create a new automated task
   - Parameters: `name`, `schedule` (cron), `actions` (list of agent commands), `output_path`
   - Returns: task_id, next_run_time

2. **`list_automatic_tasks`**
   - List all automatic tasks
   - Parameters: `status` (active, paused, failed)
   - Returns: list of tasks with schedules and last run info

3. **`update_automatic_task`**
   - Update task schedule or actions
   - Parameters: `task_id`, `schedule`, `actions`, `enabled`
   - Returns: updated task info

4. **`delete_automatic_task`**
   - Delete an automatic task
   - Parameters: `task_id`
   - Returns: success status

5. **`run_automatic_task_now`**
   - Trigger immediate execution
   - Parameters: `task_id`
   - Returns: execution_id, status

#### Execution Tools (`tag:automatic_task_execution`)
6. **`get_task_execution_history`**
   - View execution history
   - Parameters: `task_id`, `limit`
   - Returns: execution logs, success/failure stats

7. **`generate_database_summary`**
   - Generate summary of database contents
   - Parameters: `tables` (list), `time_range`, `format` (markdown, json)
   - Returns: summary content

8. **`export_to_markdown`**
   - Export data to markdown file
   - Parameters: `content`, `file_path`, `template`
   - Returns: file path, size

9. **`coordinate_agent_actions`**
   - Execute a sequence of agent commands
   - Parameters: `actions` (list of {agent, command, params})
   - Returns: results for each action

### Database Schema

```sql
-- Automatic tasks configuration
CREATE TABLE automatic_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    schedule TEXT NOT NULL,  -- cron expression
    actions JSONB NOT NULL,  -- [{agent: 'food_agent', command: 'get summary', params: {}}]
    output_path TEXT,  -- where to save results
    output_format TEXT DEFAULT 'markdown',  -- markdown, json, csv
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automatic_tasks_next_run ON automatic_tasks(next_run_at) WHERE enabled = TRUE;

-- Execution history
CREATE TABLE automatic_task_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES automatic_tasks(id) ON DELETE CASCADE,
    status TEXT NOT NULL,  -- 'running', 'success', 'failed', 'partial'
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    actions_executed JSONB,  -- results for each action
    output_files TEXT[],
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automatic_task_executions_task ON automatic_task_executions(task_id, started_at DESC);
CREATE INDEX idx_automatic_task_executions_status ON automatic_task_executions(status, started_at DESC);
```

### Configuration

**config/agents.yaml addition:**
```yaml
  - name: automatic_task_agent
    enabled: true
    context_key: automation
    prompt_file: prompts/automatic_task_agent.txt
    partials:
      - prompts/partials/safety.txt
      - prompts/partials/style.txt
    tools:
      - tag:automatic_task_core
      - tag:automatic_task_execution
      - tag:memory_context
    exclude_tools: []
    keywords:
      - term: automate
        weight: 2.0
      - term: automatic
        weight: 2.0
      - schedule
      - recurring
      - daily
      - weekly
      - summary
      - export
      - generate
      - report
    description: Automates recurring tasks, generates summaries, and coordinates agent actions.
```

### Prompt Template

**prompts/automatic_task_agent.txt:**
```
You are the Automatic Task Agent. Your focus:
- Create and manage automated recurring tasks
- Generate daily/weekly summaries and reports
- Coordinate actions across multiple agents
- Export data to files (markdown, JSON, CSV)
- Monitor automated task execution and handle failures

Guidelines:
- Use cron syntax for schedules (e.g., "0 8 * * *" for 8 AM daily)
- Chain agent actions logically (gather data → process → export)
- Save outputs to organized file paths
- Retry failed tasks with exponential backoff
- Log all execution results for debugging
- Suggest useful automation workflows to users

Common Automation Patterns:
- Daily summary: Generate overview of tasks/events/food at 8 AM
- Weekly review: Compile completed tasks, event attendance, meal patterns
- Data export: Backup important data to markdown files
- Reminder chains: Create tasks based on calendar events
- Cleanup: Archive old completed items monthly

Example Automated Tasks:
1. "Daily Summary" - Generate markdown with tasks due today, events today, food log summary
2. "Weekly Review" - Export completed tasks, event summaries, food preferences to vault
3. "Monthly Cleanup" - Archive completed tasks/events older than 90 days
4. "Backup Export" - Export all data to JSON files weekly
```

### Predefined Automation Templates

**Built-in Templates:**

1. **Daily Summary**
   ```json
   {
     "name": "Daily Summary",
     "schedule": "0 8 * * *",
     "actions": [
       {"agent": "task_agent", "command": "get_tasks_due_today"},
       {"agent": "event_agent", "command": "get_events_today"},
       {"agent": "food_agent", "command": "analyze_yesterday_meals"},
       {"agent": "automatic_task_agent", "command": "export_to_markdown", "params": {"template": "daily_summary"}}
     ],
     "output_path": "/mnt/user/data/vault/summaries/daily/{{date}}.md"
   }
   ```

2. **Weekly Review**
   ```json
   {
     "name": "Weekly Review",
     "schedule": "0 20 * * 0",
     "actions": [
       {"agent": "task_agent", "command": "get_completed_tasks", "params": {"days": 7}},
       {"agent": "event_agent", "command": "get_past_events", "params": {"days": 7}},
       {"agent": "food_agent", "command": "analyze_food_patterns", "params": {"days": 7}},
       {"agent": "automatic_task_agent", "command": "export_to_markdown", "params": {"template": "weekly_review"}}
     ],
     "output_path": "/mnt/user/data/vault/summaries/weekly/week_{{week_number}}.md"
   }
   ```

### Implementation Files

1. **tools/automatic_tasks.py** (~500 lines)
   - Implement all 9 tools
   - Cron scheduling logic
   - Agent coordination framework
   - Export/summary generation
   - Error handling and retries

2. **routers/automation.py** (~250 lines)
   - GET `/api/automation/tasks` - List automatic tasks
   - POST `/api/automation/tasks` - Create automatic task
   - PUT `/api/automation/tasks/{id}` - Update task
   - DELETE `/api/automation/tasks/{id}` - Delete task
   - POST `/api/automation/tasks/{id}/run` - Run now
   - GET `/api/automation/executions` - Execution history
   - GET `/api/automation/templates` - Predefined templates

3. **services/automatic_tasks.py** (~200 lines)
   - Background scheduler for automatic tasks
   - Execution engine
   - Result aggregation and file writing

4. **templates/summaries/** (~100 lines)
   - `daily_summary.md.jinja2`
   - `weekly_review.md.jinja2`
   - `monthly_report.md.jinja2`

5. **migrations/011_automatic_tasks.sql**
   - Create automatic_tasks table
   - Create automatic_task_executions table
   - Create indexes

### Testing Plan

1. **Unit Tests:**
   - Test cron parsing and next run calculation
   - Test agent coordination logic
   - Test markdown template rendering
   - Test retry logic

2. **Integration Tests:**
   - Create automatic task and wait for execution
   - Test multi-agent coordination
   - Verify markdown file generation
   - Test failure handling and retries

3. **Acceptance Criteria:**
   - ✅ Schedule runs at exact specified times
   - ✅ Generate daily summary with all sections
   - ✅ Chain 3+ agent actions successfully
   - ✅ Handle failed actions gracefully
   - ✅ Export to organized file structure

---

## 3. unRAID Monitoring Agent 🖥️

### Purpose
Track unRAID host metrics and array health, alert on disk/network/container problems.

### Capabilities
- Monitor unRAID array status (parity, disk health)
- Track disk usage and temperatures
- Monitor Docker container resource usage on unRAID
- Check network statistics
- Alert on disk failures, high temps, space issues
- Monitor cache drive usage
- Track parity check progress
- Detect and alert on array notifications

### Tools Required

#### Core Tools (`tag:unraid_monitoring_core`)
1. **`check_array_status`**
   - Check unRAID array health
   - Returns: array_state, parity_valid, sync_progress, disk_statuses

2. **`get_disk_health`**
   - Get SMART data and disk health
   - Parameters: `disk_name` (optional)
   - Returns: disk_name, health_status, temperature, errors, reallocated_sectors

3. **`check_disk_space`**
   - Check disk space usage
   - Parameters: `disk_name` (optional, defaults to all)
   - Returns: disk_name, total, used, free, percentage_used

4. **`get_docker_stats`**
   - Get Docker container resource usage
   - Returns: container_name, cpu_percent, memory_usage, network_io, disk_io

5. **`get_network_stats`**
   - Get network interface statistics
   - Returns: interface_name, bytes_sent, bytes_received, errors, drops

#### Analytics Tools (`tag:unraid_monitoring_analytics`)
6. **`get_temperature_trends`**
   - Get disk temperature history
   - Parameters: `disk_name`, `time_range`
   - Returns: timestamps, temperatures, alert_threshold

7. **`predict_disk_failure`**
   - Analyze SMART data for failure prediction
   - Parameters: `disk_name`
   - Returns: risk_level, predicted_days, indicators

8. **`get_parity_history`**
   - Get parity check history
   - Returns: date, duration, errors, speed

### Implementation Approach

**Challenge:** unRAID API access is limited. Need to use:
1. **unRAID API:** If available via plugins (e.g., Dynamix System Stats)
2. **SSH Commands:** Execute via Docker host access
3. **File Parsing:** Read `/proc`, `/sys`, unRAID log files
4. **MCP Integration:** Create MCP server for unRAID if needed

**Recommendation:** Start with SSH command execution, migrate to native API when available.

### Database Schema

```sql
CREATE TABLE unraid_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,  -- 'disk', 'array', 'network', 'docker'
    component_name TEXT NOT NULL,  -- disk name, container name, etc.
    metric_data JSONB NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_unraid_metrics_type ON unraid_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_unraid_metrics_component ON unraid_metrics(component_name, recorded_at DESC);

CREATE TABLE unraid_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,  -- 'disk_failure', 'high_temp', 'array_stopped', etc.
    severity TEXT NOT NULL,
    component_name TEXT,
    message TEXT NOT NULL,
    details JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Configuration

**config/agents.yaml addition:**
```yaml
  - name: unraid_monitoring_agent
    enabled: false  # Enable after setup
    context_key: unraid
    prompt_file: prompts/unraid_monitoring_agent.txt
    partials:
      - prompts/partials/safety.txt
      - prompts/partials/style.txt
    tools:
      - tag:unraid_monitoring_core
      - tag:unraid_monitoring_analytics
      - tag:memory_context
    exclude_tools: []
    keywords:
      - term: unraid
        weight: 2.0
      - array
      - disk
      - parity
      - docker stats
      - temperature
      - smart
      - cache drive
    description: Monitors unRAID server health, array status, and disk metrics.
```

### Estimated Complexity: **HIGH**

**Challenges:**
- Requires host system access (SSH or bind mounts)
- Need to parse various unRAID-specific files and commands
- SMART data parsing complexity
- Security considerations for host access

**Dependencies:**
- SSH access to unRAID host OR
- Volume mounts for `/proc`, `/sys`, unRAID config OR
- unRAID API plugin

---

## 4. Home Assistant Monitoring Agent 🏠

### Purpose
Watch Home Assistant entities/automations and notify on sensor or automation anomalies.

### Capabilities
- Monitor Home Assistant entity states
- Track automation execution
- Alert on sensor anomalies (out of range, offline)
- Detect failed automations
- Monitor device availability
- Track energy usage from sensors
- Alert on security events (door/window sensors)

### Tools Required

#### Core Tools (`tag:homeassistant_monitoring_core`)
1. **`get_entity_state`**
   - Get current state of entity
   - Parameters: `entity_id`
   - Returns: state, attributes, last_changed, last_updated

2. **`get_entities_by_domain`**
   - Get all entities of a domain
   - Parameters: `domain` (sensor, switch, light, etc.)
   - Returns: list of entities with states

3. **`check_automation_status`**
   - Check automation last run and status
   - Parameters: `automation_id`
   - Returns: enabled, last_triggered, state

4. **`get_sensor_history`**
   - Get sensor value history
   - Parameters: `entity_id`, `time_range`
   - Returns: timestamps, values

5. **`detect_offline_devices`**
   - Find unavailable/offline devices
   - Returns: list of unavailable entities

#### Analytics Tools (`tag:homeassistant_monitoring_analytics`)
6. **`detect_sensor_anomalies`**
   - Detect abnormal sensor readings
   - Parameters: `entity_id`, `threshold_std_dev`
   - Returns: anomalies, baseline, current_value

7. **`check_automation_failures`**
   - Find failed automation runs
   - Parameters: `hours_back`
   - Returns: failed_automations, error_messages

8. **`get_energy_summary`**
   - Aggregate energy sensor data
   - Parameters: `time_range`
   - Returns: total_usage, by_device, trends

### Implementation Approach

**Integration Method:** Home Assistant REST API + WebSocket

**Prerequisites:**
- Home Assistant instance accessible from AI Stack network
- Long-lived access token
- Home Assistant URL configured in environment

### Database Schema

```sql
CREATE TABLE homeassistant_entity_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    state TEXT NOT NULL,
    attributes JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ha_entity_states ON homeassistant_entity_states(entity_id, recorded_at DESC);

CREATE TABLE homeassistant_automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id TEXT NOT NULL,
    automation_name TEXT,
    status TEXT NOT NULL,  -- 'success', 'failed'
    trigger_data JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    executed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homeassistant_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id TEXT,
    automation_id TEXT,
    alert_type TEXT NOT NULL,  -- 'sensor_anomaly', 'device_offline', 'automation_failed', etc.
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Configuration

**config/agents.yaml addition:**
```yaml
  - name: homeassistant_monitoring_agent
    enabled: false  # Enable after Home Assistant setup
    context_key: homeassistant
    prompt_file: prompts/homeassistant_monitoring_agent.txt
    partials:
      - prompts/partials/safety.txt
      - prompts/partials/style.txt
    tools:
      - tag:homeassistant_monitoring_core
      - tag:homeassistant_monitoring_analytics
      - tag:memory_context
    exclude_tools: []
    keywords:
      - term: home assistant
        weight: 2.0
      - entity
      - automation
      - sensor
      - device
      - smart home
      - unavailable
      - offline
    description: Monitors Home Assistant entities, automations, and sensors.
```

### Environment Configuration

**docker-compose.yml additions:**
```yaml
environment:
  - HOMEASSISTANT_URL=http://192.168.1.100:8123
  - HOMEASSISTANT_TOKEN=your_long_lived_token_here
  - HOMEASSISTANT_ENABLED=true
```

### Estimated Complexity: **HIGH**

**Challenges:**
- Need Home Assistant instance configured
- WebSocket connection management
- Entity state tracking and history
- Anomaly detection algorithms
- Large number of potential entities to monitor

**Dependencies:**
- Home Assistant instance
- Network connectivity to Home Assistant
- Long-lived access token
- Home Assistant REST API knowledge

---

## Implementation Order & Timeline

### Phase 1: Foundation (Week 1)
- **Day 1-3:** System Monitoring Agent
  - Implement tools and database schema
  - Create agent configuration and prompt
  - Test with Docker/Postgres/Qdrant monitoring
- **Day 4-5:** Automatic Task Agent
  - Implement scheduling and coordination
  - Create summary templates
  - Test with predefined automation templates

### Phase 2: External Integrations (Week 2)
- **Day 1-4:** unRAID Monitoring Agent
  - Research and setup host access method
  - Implement SMART data parsing
  - Create array status monitoring
  - Test alert generation
- **Day 5:** Integration testing
  - Test all 4 agents together
  - Verify routing works correctly
  - Performance testing

### Phase 3: Home Assistant (Optional - Week 3)
- **Day 1-4:** Home Assistant Monitoring Agent
  - Only if user has Home Assistant
  - Setup API integration
  - Implement entity monitoring
  - Test automation tracking

---

## Common Implementation Patterns

All agents follow these patterns established by existing agents:

### 1. File Structure
```
containers/langgraph-agents/
├── tools/
│   ├── system_monitoring.py
│   ├── automatic_tasks.py
│   ├── unraid_monitoring.py
│   └── homeassistant_monitoring.py
├── routers/
│   ├── system.py
│   ├── automation.py
│   ├── unraid.py
│   └── homeassistant.py
├── services/
│   ├── system_monitoring.py
│   └── automatic_tasks.py
├── prompts/
│   ├── system_monitoring_agent.txt
│   ├── automatic_task_agent.txt
│   ├── unraid_monitoring_agent.txt
│   └── homeassistant_monitoring_agent.txt
└── config/
    └── agents.yaml (updated)
```

### 2. Tool Tagging Convention
```python
@tool(tags=["system_monitoring_core"])
async def check_container_health(...):
    """Check Docker container health status."""
    ...
```

### 3. Router Pattern
```python
from fastapi import APIRouter, Depends
from middleware.models import StandardResponse

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/health")
async def get_system_health() -> StandardResponse:
    """Get overall system health status."""
    ...
```

### 4. Agent Registration
Tools automatically discovered via tags in `config/agents.yaml`

### 5. Scheduled Jobs
```python
# In services/scheduler.py
scheduler.add_job(
    collect_system_metrics,
    'interval',
    minutes=5,
    id='system_metrics_collection',
    replace_existing=True
)
```

---

## Testing Strategy

### Unit Tests
- Individual tool functions
- Mock external dependencies
- Test error handling

### Integration Tests
- Agent routing to correct agent
- Tool execution end-to-end
- Database operations
- API endpoints

### System Tests
- Multi-agent coordination
- Scheduled job execution
- Alert generation and notification
- File export functionality

### Acceptance Tests
- User scenarios end-to-end
- Performance under load
- Resource usage monitoring
- Alert accuracy

---

## Documentation Requirements

For each agent, create:

1. **Tool Documentation**
   - Docstrings for all tools
   - Parameter descriptions
   - Return value specifications
   - Example usage

2. **API Documentation**
   - OpenAPI/Swagger specs (auto-generated)
   - Example requests/responses
   - Authentication requirements

3. **User Guide**
   - How to use the agent
   - Common queries
   - Configuration options
   - Troubleshooting

4. **Developer Guide**
   - Architecture decisions
   - Code organization
   - Testing approach
   - Extension points

---

## Success Criteria

### System Monitoring Agent
- ✅ Detect container failure within 5 minutes
- ✅ Alert on resource thresholds (CPU >80%, Memory >90%, Disk >95%)
- ✅ Generate weekly health reports
- ✅ Provide actionable remediation suggestions
- ✅ <1 second response time for health checks

### Automatic Task Agent
- ✅ Execute scheduled tasks within 60 seconds of scheduled time
- ✅ Successfully chain 5+ agent actions
- ✅ Generate formatted markdown summaries
- ✅ Handle failures with retry logic
- ✅ Support cron expressions

### unRAID Monitoring Agent
- ✅ Detect disk temperature >50°C
- ✅ Alert on parity sync errors
- ✅ Monitor array stopped condition
- ✅ Track SMART attributes
- ✅ Predict disk failure 7+ days in advance

### Home Assistant Monitoring Agent
- ✅ Detect sensor anomalies (2σ deviation)
- ✅ Track automation execution success rate
- ✅ Alert on device offline >5 minutes
- ✅ Monitor 50+ entities efficiently
- ✅ WebSocket reconnection on failure

---

## Migration Notes

### Existing Agent Compatibility
- All new agents use same routing infrastructure
- Handoff mechanism works with new agents
- State pruning applies to all agents
- Existing tools remain available

### Database Migrations
- Incremental migrations (010-013)
- Backward compatible
- No downtime required
- Rollback scripts provided

### Configuration Management
- Add agents to `config/agents.yaml`
- Environment variables for external systems
- Feature flags for optional agents
- Docker Compose updates

---

## Security Considerations

### Host Access (unRAID Agent)
- Minimal privilege principle
- Read-only access where possible
- Audit all host commands
- Secure credential storage

### External APIs (Home Assistant Agent)
- Token rotation policy
- HTTPS/TLS required
- API rate limiting
- Input validation

### Automated Tasks
- Sandbox execution environment
- File path restrictions
- Command injection prevention
- Resource limits

---

## Performance Considerations

### Monitoring Overhead
- Collect metrics every 5 minutes (configurable)
- Batch database inserts
- Index optimization for time-series queries
- Data retention policies (30 days default)

### Scheduled Tasks
- Concurrent execution limit (3 tasks)
- Timeout per action (5 minutes default)
- Queue overflow handling
- Resource usage monitoring

---

## Future Enhancements

### System Monitoring Agent
- Grafana dashboard integration
- Predictive alerting with ML
- Auto-remediation actions
- Performance benchmarking

### Automatic Task Agent
- Visual workflow builder
- Conditional logic (if/else)
- Loop constructs
- Variable passing between actions

### unRAID Monitoring Agent
- VM monitoring
- Plugin update tracking
- Cache pool optimization suggestions
- Automated disk spin-down coordination

### Home Assistant Monitoring Agent
- Scene monitoring
- Energy optimization suggestions
- Integration with automation creation
- Predictive maintenance alerts

---

## Getting Started

To implement these agents, start with:

1. **Review Existing Code:**
   - Study `tools/database.py` for tool patterns
   - Review `graph/workflow.py` for agent flow
   - Check `routers/tasks.py` for API patterns

2. **Setup Environment:**
   - Create feature branch
   - Run migrations for new tables
   - Install any new dependencies

3. **Implement in Order:**
   - System Monitoring (foundational)
   - Automatic Task (high value, low complexity)
   - unRAID/Home Assistant (based on user needs)

4. **Test Thoroughly:**
   - Write tests alongside implementation
   - Test routing and handoffs
   - Verify API endpoints
   - Check scheduled job execution

5. **Document:**
   - Update README.md
   - Write agent-specific docs
   - Create example queries
   - Record demo videos

---

## Questions & Decisions

**To Be Decided:**
1. Should System Monitoring Agent auto-restart failed containers?
2. What's the default retention period for metrics (30/60/90 days)?
3. Should Automatic Task Agent support webhooks/external triggers?
4. Enable unRAID monitoring via SSH or bind mounts?
5. Home Assistant: poll vs WebSocket for entity updates?
6. Alert notification channels (email, webhook, in-app)?

**Open Questions:**
1. How to handle agent versioning and backwards compatibility?
2. Should we create a meta-agent for agent management?
3. Rate limiting for automated tasks?
4. Maximum concurrent automatic tasks?

---

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Docker SDK for Python](https://docker-py.readthedocs.io/)
- [Home Assistant API](https://developers.home-assistant.io/docs/api/rest/)
- [SMART Attributes Reference](https://en.wikipedia.org/wiki/S.M.A.R.T.)
- [Cron Expression Syntax](https://crontab.guru/)

---

**Document Version:** 1.0
**Created:** 2025-11-23
**Last Updated:** 2025-11-23
**Status:** Planning - Ready for Implementation
