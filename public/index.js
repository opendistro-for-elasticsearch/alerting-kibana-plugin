import { AlertingPlugin } from './plugin';

export function plugin(initializerContext) {
  return new AlertingPlugin(initializerContext);
}
