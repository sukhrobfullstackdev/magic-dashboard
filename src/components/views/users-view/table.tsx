import { SignupAppUser } from '@hooks/data/app-users/types';
import { css } from '@styled/css';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

type TableProps = {
  data: SignupAppUser[];
  columns: ColumnDef<SignupAppUser, unknown>[];
};

const Table = ({ data, columns }: TableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className={css({ w: 'full' })}>
      <thead className={css({ borderBottomWidth: 'thin', borderBottomColor: 'neutral.tertiary' })}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={css({ h: '3.375rem' })}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  className={css({
                    textAlign: 'left',
                    verticalAlign: 'middle',
                  })}
                  style={{
                    width:
                      header.index === 0 ? '36px' : header.index === headerGroup.headers.length - 1 ? '60px' : 'auto',
                    textOverflow: 'ellipsis',
                    ...(header.index !== 0 &&
                      header.index === headerGroup.headers.length - 2 && {
                        width: '220px',
                      }),
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={css({ h: '3.625rem', borderBottomWidth: 'thin', borderBottomColor: 'neutral.tertiary' })}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={css({
                  textAlign: 'left',
                  verticalAlign: 'middle',
                })}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
