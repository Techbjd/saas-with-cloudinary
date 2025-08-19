declare module "daisyui" {
  import type { PluginCreator } from "tailwindcss/types/config";

  interface DaisyUIOptions {
    themes?: string[] | boolean;
    styled?: boolean;
    base?: boolean;
    utils?: boolean;
    logs?: boolean;
    rtl?: boolean;
    prefix?: string;
  }

  const plugin: PluginCreator;
  export default plugin;
}
