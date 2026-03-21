import React from "react";
import styles from './Table.module.scss';

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (item: T) => React.ReactNode;
};

export default function Table<T extends { id: number }>({
  columns,
  data,
  actions,
}: TableProps<T>) {
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          {columns.map((col) => (
            <th key={col.key as string} className={styles.th}>{col.label}</th>
          ))}
          {actions && <th className={`${styles.th} ${styles.actions}`}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className={styles.tr}>
            {columns.map((col) => (
              <td key={col.key as string} className={styles.td}>
                {col.render ? col.render(item) : item[col.key as keyof T]}
              </td>
            ))}
            {actions && <td className={`${styles.td} ${styles.actions}`}>{actions(item)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}