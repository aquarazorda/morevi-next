import "@tanstack/react-table"; //or vue, svelte, solid, etc.

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData> {
    className?: string;
    onClick?: (row: Row<TData>) => void;
  }
}
