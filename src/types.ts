export type AppVariables = {
  requestId: string;
};

export type AppEnv = {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
};
