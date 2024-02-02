import { FEEDDECK_LOG_LEVEL } from './constants.ts';

export const log = (
  level: 'debug' | 'info' | 'warning' | 'error',
  message: string,
  // deno-lint-ignore no-explicit-any
  fields?: Record<string, any>,
) => {
  /**
   * Check that the provided log level is within the configured log level
   * (FEEDDECK_LOG_LEVEL). If this is the case the log line will be printed to
   * the console, otherwise it will be ignored.
   */
  switch (FEEDDECK_LOG_LEVEL) {
    case 'info':
      if (level === 'debug') {
        return;
      }
      break;
    case 'warning':
      if (level === 'debug' || level === 'info') {
        return;
      }
      break;
    case 'error':
      if (level === 'error' || level === 'warning' || level === 'info') {
        return;
      }
      break;
    default:
      break;
  }

  const output = JSON.stringify({
    'time': new Date().toUTCString(),
    'level': level,
    'caller': caller(),
    message: message,
    ...fields,
  });

  switch (level) {
    case 'debug':
      console.debug(output);
      break;
    case 'info':
      console.info(output);
      break;
    case 'warning':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
    default:
      console.log(output);
      break;
  }
};

/**
 * The caller function is used to get the file name of the parent function, so
 * that we can add it to each log line.
 * See: https://github.com/apiel/caller
 */
interface Bind {
  cb?: (file: string) => string;
}

const up = 3;

// deno-lint-ignore no-explicit-any
function caller(this: Bind | any, levelUp = up) {
  const err = new Error();
  const stack = err.stack?.split('\n')[levelUp];
  if (stack) {
    return getFile.bind(this)(stack);
  }
}

// deno-lint-ignore no-explicit-any
function getFile(this: Bind | any, stack: string) {
  stack = stack.substring(stack.indexOf('at ') + 3);
  if (!stack.startsWith('file://')) {
    stack = stack.substring(stack.lastIndexOf('(') + 1);
  }
  const path = stack.split(':');
  let file;
  if (Deno.build.os == 'windows') {
    file = `${path[0]}:${path[1]}:${path[2]}:${path[3]}`;
  } else {
    file = `${path[0]}:${path[1]}:${path[2]}`;
  }

  if ((this as Bind)?.cb) {
    // deno-lint-ignore no-explicit-any
    const cb = (this as Bind).cb as any;
    file = cb(file);
  }
  return file;
}
