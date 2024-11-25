/** @format */

export type Handlers = Partial<
    Record<
        | "on_fetch_progress"
        | "on_error"
        | "on_unhandled_rejection"
        | "on_console"
        | "on_console_group"
        | "on_console_group_collapsed"
        | "on_console_group_end"
        | string,
        (...args: any) => any
    >
>
