import { Toast } from "@base-ui/react/toast";

export const toastManager = Toast.createToastManager();
type ToastInput = Parameters<typeof toastManager.add>[0];
type ToastRuntimeInput = ToastInput & { duration?: number };
type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastOptions = Omit<ToastRuntimeInput, "actionProps" | "type"> & {
  action?: ToastAction;
};

const transformOptions = (
  options?: ToastOptions,
): Omit<ToastRuntimeInput, "type"> => {
  if (!options) return {};
  const { action, ...rest } = options;
  if (action) {
    return {
      ...rest,
      actionProps: {
        children: action.label,
        onClick: action.onClick,
      },
    };
  }
  return rest;
};

const buildToastInput = (
  type: ToastInput["type"],
  message: string,
  options?: ToastOptions,
): ToastRuntimeInput => {
  const transformed = transformOptions(options);

  if (transformed.description) {
    return {
      ...transformed,
      title: message,
      type,
    };
  }

  return {
    ...transformed,
    description: message,
    type,
  };
};

export const toast = {
  success: (description: string, options?: ToastOptions) =>
    toastManager.add(buildToastInput("success", description, options)),
  error: (description: string, options?: ToastOptions) =>
    toastManager.add(buildToastInput("error", description, options)),
  info: (description: string, options?: ToastOptions) =>
    toastManager.add(buildToastInput("info", description, options)),
  warning: (description: string, options?: ToastOptions) =>
    toastManager.add(buildToastInput("warning", description, options)),
  custom: (options: ToastOptions) =>
    toastManager.add(transformOptions(options)),
};
