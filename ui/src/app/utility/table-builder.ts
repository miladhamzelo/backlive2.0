import { TableRow, TableColumnType, TableFooterColumn } from 'backlive/component/shared/ui';
import { Common } from './common';

export class TableBuilder {
    static rows(dataRows: {}[], model: any[], options: TableBuilderOptions = null, dataFooterRows: {}[] = []): TableRow[] {
        var rows: TableRow[] = [];
        var fieldIndex = {};
        var fieldNames = [];
        var nextFieldIndex = 0;
        var modelIndex = 0;

        dataRows.forEach(dataRow => {
            var row: TableRow = { columns: [], model: model[modelIndex], footerColumns: [] };

            for (var field in dataRow) {
                if (typeof (fieldIndex[field]) === 'undefined') {
                    fieldIndex[field] = nextFieldIndex++;
                    fieldNames.push(field);
                }

                var column;

                //check to see if we passed in a fully defined TableColumn, or just a value
                if (Common.isObject(dataRow[field]) && Common.isDefined(dataRow[field].name) && Common.isDefined(dataRow[field].value)) {
                    column = dataRow[field];
                }
                else {
                    column = { name: field, value: dataRow[field] != null ? dataRow[field] : '' };
                }

                if (options) {
                    if (options.columnTypes) {
                        if (Common.isArray(options.columnTypes[field])) {
                            column.type = options.columnTypes[field][0];
                            column.typeParam = options.columnTypes[field][1];
                        }
                        else {
                            column.type = <TableColumnType>options.columnTypes[field];
                        }
                    }

                    if (options.clickableColumns && options.clickableColumns[field]) {
                        column.clickable = true;
                    }

                    if (options.filterableColumns && options.filterableColumns[field]) {
                        column.filterable = true;
                    }
                }

                row.columns[fieldIndex[field]] = column;
            }

            rows.push(row);
            modelIndex++;
        });

        rows.forEach(row => {
            for (var i = 0; i < nextFieldIndex; i++) {
                if (!row.columns[i]) {
                    var column: any = { name: fieldNames[i], value: '' };
                    row.columns[i] = column;
                }
            }
        });

        if (rows[0] && dataFooterRows.length > 0) {
            rows[0].footerColumns = TableBuilder.getFooterColumns(dataFooterRows);
        }

        return rows;
    }

    private static getFooterColumns(dataFooterRows: {}[]): TableFooterColumn[] {
        var footerRow: TableFooterColumn[] = [];

        if (dataFooterRows.length > 0) {
            dataFooterRows.forEach((dataRow) => {
                for (var field in dataRow) {
                    var footerColumn: TableFooterColumn = { name: field, value: dataRow[field] != null ? dataRow[field] : '' };
                    footerRow.push(footerColumn);
                }
            });
        }
        return footerRow;
    }
}

export interface TableBuilderOptions {
    columnTypes?: { [key: string]: TableColumnType | [TableColumnType, string] };
    clickableColumns?: { [key: string]: boolean };
    filterableColumns?: { [key: string]: boolean };
}