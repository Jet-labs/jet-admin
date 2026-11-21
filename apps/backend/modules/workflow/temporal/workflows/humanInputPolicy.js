// Deterministic deadline normalization. Zero means no deadline in both layers.
export function humanInputTimeoutMs(nodeData = {}, workflowConfig = {}, collectionConfig = {}) {
  if (nodeData.expiryMinutes !== undefined && nodeData.expiryMinutes !== null) {
    const minutes = Number(nodeData.expiryMinutes);
    if (!Number.isFinite(minutes) || minutes < 0) throw new Error('expiryMinutes must be a non-negative number');
    return minutes === 0 ? null : minutes * 60000;
  }
  const duration = nodeData.timeout ?? workflowConfig.humanInLoopTimeout;
  if (duration === undefined || duration === null) {
    const minutes = Number(collectionConfig.expiryMinutes ?? 60);
    if (!Number.isFinite(minutes) || minutes < 0) throw new Error('Invalid human-input expiry');
    return minutes === 0 ? null : minutes * 60000;
  }
  if (typeof duration === 'number') {
    if (!Number.isFinite(duration) || duration < 0) throw new Error('Invalid human-input duration');
    return duration === 0 ? null : duration * 1000;
  }
  const match = /^\s*(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|seconds?|m|minutes?|h|hours?|d|days?)\s*$/i.exec(String(duration));
  if (!match) throw new Error(`Invalid human-input duration: ${duration}`);
  const unit = match[2].toLowerCase();
  const multiplier = unit === 'ms' || unit.startsWith('millisecond') ? 1
    : unit === 's' || unit.startsWith('second') ? 1000
    : unit === 'm' || unit.startsWith('minute') ? 60000
    : unit === 'h' || unit.startsWith('hour') ? 3600000 : 86400000;
  const milliseconds = Number(match[1]) * multiplier;
  return milliseconds === 0 ? null : milliseconds;
}
