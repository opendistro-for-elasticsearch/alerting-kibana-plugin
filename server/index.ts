import { schema, TypeOf } from "@kbn/config-schema";
import { PluginConfigDescriptor, PluginInitializerContext } from "../../../src/core/server";
import { AlertingPlugin } from "./plugin";

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
});

export type AlertingPluginConfigType = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<AlertingPluginConfigType> = {
  exposeToBrowser: { // following configs are visible to browser side plugin
    enabled: true,
  },
  schema: configSchema,
}

// you can define attributes in following types, so that other plugins can use them
// if they declare dependency on this plugin
export interface AlertingPluginSetup {}
export interface AlertingPluginStart {}

// entry point
export function plugin(initializerContext: PluginInitializerContext) {
  return new AlertingPlugin(initializerContext);
}
