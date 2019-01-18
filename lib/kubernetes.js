'use strict';

// https://github.com/kubernetes/kubernetes/blob/151830e45fbb933f932d291f165dfe69ec1c7e01/pkg/printers/internalversion/printers.go#L581
module.exports.podStatus = function (pod) {
  let reason = pod.status.reason || pod.status.phase;
  let initializing = false;
  (pod.status.initContainerStatuses || []).forEach(container => {
    const state = container.state;
    if (state.terminated && state.terminated.exitCode === 0) {
      // initialization is complete
      return;
    }
    if (state.terminated) {
      // initialization is failed
      if (!state.terminated.reason) {
        if (state.terminated.signal) {
          reason = `Init:Signal:${state.terminated.signal}`;
        } else {
          reason = `Init:ExitCode:${state.terminated.exitCode}`;
        }
      } else {
        reason = `Init:${state.terminated.reason}`;
      }
      initializing = true;
      return true;
    }

    if (state.waiting && state.waiting.reason && state.waiting.reason !== 'PodInitializing') {
      reason = `Init:${state.waiting.reason}`;
      initializing = true;
    }
  });

  if (!initializing) {
    let hasRunning = false;
    (pod.status.containerStatuses || []).forEach(container => {
      const state = container.state;
      if (state.waiting && state.waiting.reason) {
        reason = state.waiting.reason;
      } else if (state.terminated && state.terminated.reason) {
        reason = state.terminated.reason;
      } else if (state.terminated && !state.terminated.reason) {
        if (state.terminated.signal !== 0) {
          reason = `Signal:${state.terminated.signal}`;
        } else {
          reason = `ExitCode:${state.terminated.exitCode}`;
        }
      } else if (container.ready && state.running) {
        hasRunning = true;
      }
    });
    // change pod status back to 'Running' if there is at least one container still reporting as 'Running' status
    if (reason === 'Completed' && hasRunning) {
      reason = 'Running';
    }
  }

  if (pod.metadata.DeletionTimestamp && pod.status.reason === 'NodeLost') {
    reason = 'Unknown';
  } else if (pod.metadata.deletionTimestamp) {
    reason = 'Terminating';
  }

  return reason;
}

module.exports.isPodRunning = function (pod) {
  return module.exports.podStatus(pod) === 'Running';
}

module.exports.isPodTerminating = function (pod) {
  return module.exports.podStatus(pod) === 'Terminating';
}

module.exports.isPodRunningOrTerminating = function (pod) {
  const status = module.exports.podStatus(pod);
  return status === 'Running' || status === 'Terminating';
}

module.exports.isPodCompleted = function (pod) {
  return module.exports.podStatus(pod) === 'Completed';
}
