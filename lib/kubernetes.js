'use strict';

// This logic is replicated from k8s (at this writing, Kubernetes 1.15)
// (See https://github.com/kubernetes/kubernetes/blob/release-1.15/pkg/printers/internalversion/printers.go)
module.exports.podPhase = function (pod) {
  if (!pod || !pod.status) {
    return '';
  }

  if (pod.metadata.deletionTimestamp) {
    return 'Terminating';
  }

  if (pod.status.reason === 'Evicted') {
    return 'Evicted';
  }

  let initializing = false;
  let phase = pod.status.phase || pod.status.reason;

  (pod.status.initContainerStatuses || []).every((container, i) => {
    const { terminated, waiting } = container.state;
    if (terminated && terminated.exitCode === 0) {
      return true;
    }

    initializing = true;
    if (terminated && terminated.reason) {
      phase = `Init:${terminated.reason}`;
    } else if (terminated && !terminated.reason) {
      phase = terminated.signal
        ? `Init:Signal:${terminated.signal}`
        : `Init:ExitCode:${terminated.exitCode}`;
    } else if (waiting && waiting.reason && waiting.reason !== 'PodInitializing') {
      phase = `Init:${waiting.reason}`;
    } else {
      phase = `Init:${i}/${pod.status.initContainerStatuses.length}`;
    }
    return false;
  });

  if (!initializing) {
    let hasRunning = false;
    (pod.status.containerStatuses || []).forEach(container => {
      const { running, terminated, waiting } = container.state;
      if (terminated && terminated.reason) {
        phase = terminated.reason;
      } else if (waiting && waiting.reason) {
        phase = waiting.reason;
      } else if (waiting && !waiting.reason) {
        phase = terminated.signal
          ? `Signal:${terminated.signal}`
          : `ExitCode:${terminated.exitCode}`;
      } else if (running && container.ready) {
        hasRunning = true;
      }
    });

    // Change pod status back to "Running" if there is at least one container
    // still reporting as "Running" status.
    if (phase === 'Completed' && hasRunning) {
      phase = 'Running';
    }
  }

  return phase;
}

module.exports.isPodRunning = function (pod) {
  return module.exports.podPhase(pod) === 'Running';
}

module.exports.isPodTerminating = function (pod) {
  return module.exports.podPhase(pod) === 'Terminating';
}

module.exports.isPodRunningOrTerminating = function (pod) {
  const status = module.exports.podPhase(pod);
  return status === 'Running' || status === 'Terminating';
}

module.exports.isPodCompleted = function (pod) {
  return module.exports.podPhase(pod) === 'Completed';
}

module.exports.isPodError = function (pod) {
  return module.exports.podPhase(pod) === 'Error';
}

module.exports.isPodCrashLoopBackOff = function (pod) {
  return module.exports.podPhase(pod) === 'CrashLoopBackOff';
}

module.exports.containerStatus = function (pod, container) {
  const statuses = pod.status.containerStatuses.concat(pod.status.initContainerStatuses || []);
  return statuses.find(status => status.name === container.name);
}

module.exports.containerState = function (pod, container) {
  const status = module.exports.containerStatus(pod, container);
  if (typeof status.state.waiting === 'object') {
    return 'waiting';
  } else if (typeof status.state.running === 'object') {
    return 'running';
  } else if (typeof status.state.terminated === 'object') {
    return 'terminated';
  }
  return '';
}

module.exports.isContainerWaiting = function (pod, container) {
  return module.exports.containerState(pod, container) === 'waiting';
}

module.exports.isContainerWaitingWithReasons = function (pod, container, ...reasons) {
  const status = module.exports.containerStatus(pod, container);
  if (typeof status.state.waiting === 'object') {
    return reasons.includes(status.state.waiting.reason);
  }
  return false;
}

module.exports.isContainerRunning = function (pod, container) {
  return typeof module.exports.containerState(pod, container) === 'running';
}

module.exports.isContainerTerminated = function (pod, container) {
  return typeof module.exports.containerState(pod, container) === 'terminated';
}
