//AbsenceLogTable.js
import { React } from 'react';
import { useTable, useFilters, useGlobalFilter } from 'react-table';
import { GlobalFilter, DefaultFilterForColumn } from './AbsenceLogTableFilter';

export default function AbsenceLogTable({ columns, data, getRowProps = () => ({})  }) {
    //Had a lot runtime errors when trying to work on this AbsenceLogTable.js functional component.
    //As a result, I had to use the console.log here to check the columns variable and data variable .
    //console.log(columns);
    //console.log(data);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    state,
    visibleColumns,
    prepareRow,
    setGlobalFilter,
    preGlobalFilteredRows,
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultFilterForColumn }
    },
    useFilters,
    useGlobalFilter
  );

  return (
    <div className="table-responsive border">
    <table className="table w-100 border table-borderless" {...getTableProps()}>
      <thead>
        <tr>
          <th
            colSpan={visibleColumns.length}
            style={{
              textAlign: 'center',
            }}
          >
            {/* rendering global filter */}
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </th>
        </tr>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} >
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>
                {column.render("Header")}
                {/* rendering column filter */}
                <div>{column.canFilter ? column.render('Filter') : null}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr  {...row.getRowProps(getRowProps(row))}>
              {row.cells.map((cell) => {
                /*https://codesandbox.io/s/tannerlinsleyreact-table-basic-evgp3?file=/src/App.js:1565-1643  */
                return <td className="text-start"  {...cell.getCellProps({
                  className: cell.column.className
                })} >{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}