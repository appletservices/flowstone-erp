import { ModulePermissions } from "./useRoles";

export function mapApiPermissions(
  permissions: { name: string }[]
): Record<string, ModulePermissions> {
  const mapped: Record<string, ModulePermissions> = {};

  permissions.forEach((p) => {
    const [moduleId, action] = p.name.split(".");

    if (!mapped[moduleId]) {
      mapped[moduleId] = {
        view: false,
        create: false,
        update: false,
        delete: false,
      };
    }

    if (action in mapped[moduleId]) {
      mapped[moduleId][action as keyof ModulePermissions] = true;
    }
  });

  return mapped;
}
