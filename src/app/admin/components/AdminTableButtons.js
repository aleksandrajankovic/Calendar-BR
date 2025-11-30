"use client";

export function StatusToggleButton({
  active,
  onClick,
  className = "",
  activeLabel = "Deactivate",
  inactiveLabel = "Activate",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `w-full h-8 text-xs rounded border uppercase cursor-pointer
        ${
          active
            ? "border-[#4A4A4A] text-[#4A4A4A] bg-white hover:bg-neutral-50"
            : "border-green-600 text-green-700 bg-white hover:bg-green-50"
        } ` + className
      }
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

export function IconButton({
  variant, // "edit" | "add" | "delete"
  onClick,
  title,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={
        `inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#5F5F5F]
         hover:brightness-110 disabled:opacity-50 ` + className
      }
    >
      {variant === "edit" && (
        // pencil
        <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
          <path
            d="M10.1455 11.2559H0V10.1289H10.1455V11.2559ZM6.84375 0C6.99318 2.04314e-05 7.13651 0.0593917 7.24219 0.165039L8.83691 1.75879C8.88931 1.81113 8.93062 1.87397 8.95898 1.94238C8.98724 2.01069 9.00195 2.08428 9.00195 2.1582C9.00189 2.23211 8.98729 2.30574 8.95898 2.37402C8.93063 2.44227 8.8892 2.50441 8.83691 2.55664L2.3916 9.00195H0V6.61035L6.44531 0.165039C6.55101 0.0594016 6.69431 0 6.84375 0Z"
            fill="white"
          />
        </svg>
      )}

      {variant === "add" && (
        // plus
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="stroke-white"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {variant === "delete" && (
        // trash
        <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true">
          <path
            d="M7.85742 3.11133C8.64301 3.11149 9.28613 3.81154 9.28613 4.66699V12.4443C9.28613 13.2998 8.64301 13.9998 7.85742 14H2.14258C1.35699 13.9998 0.713867 13.2998 0.713867 12.4443V4.66699C0.713867 3.81154 1.35699 3.11149 2.14258 3.11133H7.85742ZM6.49316 0C6.67878 9.41196e-05 6.86466 0.085663 6.99316 0.225586L7.5 0.777344H9.28613C9.6788 0.777592 10 1.12804 10 1.55566C9.99995 1.98324 9.67877 2.33276 9.28613 2.33301H0.713867C0.321234 2.33276 5.4316e-05 1.98324 0 1.55566C0 1.12804 0.3212 0.777592 0.713867 0.777344H2.5L3.00684 0.225586C3.13534 0.085663 3.32122 9.41927e-05 3.50684 0H6.49316Z"
            fill="white"
          />
        </svg>
      )}
    </button>
  );
}
