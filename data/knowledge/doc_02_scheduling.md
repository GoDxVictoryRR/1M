---
source_id: KB-SCH-002
title: Carbon-Aware Workload Scheduling and Standby Optimization
publisher: Green Software Foundation
date: 2024-04-10
tags: [scheduling, off-peak, standby, carbon-aware]
url: https://greensoftware.foundation/standards/scheduling
---

# Carbon-Aware Workload Scheduling and Standby Optimization

## Non-Critical Workload Management
Development, staging, testing, and batch processing environments do not require 24/7 continuous uptime. Telemetry indicates that unmanaged dev/test environments consume up to 65% of their total energy during unattended off-peak periods (nights and weekends).

## Scheduling Guidelines
1. **Automated Sleep Schedules**: Implement automated policies to place non-production infrastructure into deep sleep or full power-down between 22:00 and 06:00 local facility time.
2. **Carbon-Aware Delay**: For delay-tolerant batch compute (such as data transformations or model training), schedule execution to align with local grid renewable peaks (such as high solar midday or high wind nocturnal periods).
3. **Standby Verification**: Ensure standby policies verify that no active transactions or backups are running prior to executing suspension routines.
