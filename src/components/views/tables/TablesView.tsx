"use client";

/**
 * Legacy demo tables page - RSI replaced with RSI-specific views.
 * Keeping for reference; RSI inventory is now at individual route pages.
 */
export const TablesView = () => {
  return (
    <div className="flex flex-col gap-6" style={{ rowGap: "1.8rem" }}>
      <h1 className="sr-only">Tables</h1>
      <p className="text-secondaryText">
        Inventory pages are now available at their respective routes.
      </p>
    </div>
  );
};
