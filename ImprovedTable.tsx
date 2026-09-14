import React, { useMemo, useState } from "react";

export interface TableRow {
  [key: string]: unknown;
}

interface ImprovedTableProps {
  data: TableRow[];
}

type QualityType =
  | "Valid"
  | "Missing"
  | "Duplicate"
  | "Invalid"
  | "Anomaly";

interface QualityResult {
  type: QualityType;
  message: string;
}

const analyzeRowData = (
  row: TableRow,
  allRows: TableRow[],
): QualityResult => {
  // 1. Check missing values
  const hasMissingValue = Object.values(row).some(
    (value) =>
      value === null ||
      value === undefined ||
      String(value).trim() === "",
  );

  if (hasMissingValue) {
    return {
      type: "Missing",
      message: "One or more values are missing.",
    };
  }

  // 2. Check duplicate records
  const rowString = JSON.stringify(row);

  const duplicateCount = allRows.filter(
    (item) => JSON.stringify(item) === rowString,
  ).length;

  if (duplicateCount > 1) {
    return {
      type: "Duplicate",
      message: "This record appears more than once.",
    };
  }

  // 3. Check invalid numerical values
  const invalidNumber = Object.values(row).some(
    (value) =>
      typeof value === "number" &&
      (!Number.isFinite(value) || value < 0),
  );

  if (invalidNumber) {
    return {
      type: "Invalid",
      message: "Invalid numerical value detected.",
    };
  }

  // 4. Check numerical anomalies
  const numericValues = Object.values(row).filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );

  if (numericValues.length > 0) {
    const average =
      numericValues.reduce(
        (sum, value) => sum + value,
        0,
      ) / numericValues.length;

    const hasAnomaly = numericValues.some(
      (value) =>
        value > average * 3 ||
        value < average / 3,
    );

    if (hasAnomaly) {
      return {
        type: "Anomaly",
        message: "Unusual numerical value detected.",
      };
    }
  }

  return {
    type: "Valid",
    message: "No data-quality issue detected.",
  };
};

const ImprovedTable: React.FC<ImprovedTableProps> = ({
  data,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<number | null>(
    null,
  );

  const columns = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    return Object.keys(data[0]);
  }, [data]);

  const qualityResults = useMemo(() => {
    return data.map((row) =>
      analyzeRowData(row, data),
    );
  }, [data]);

  const qualitySummary = useMemo(() => {
    return {
      valid: qualityResults.filter(
        (item) => item.type === "Valid",
      ).length,

      missing: qualityResults.filter(
        (item) => item.type === "Missing",
      ).length,

      duplicate: qualityResults.filter(
        (item) => item.type === "Duplicate",
      ).length,

      invalid: qualityResults.filter(
        (item) => item.type === "Invalid",
      ).length,

      anomaly: qualityResults.filter(
        (item) => item.type === "Anomaly",
      ).length,
    };
  }, [qualityResults]);

  const filteredIndexes = useMemo(() => {
    if (!search.trim()) {
      return data.map((_, index) => index);
    }

    const searchValue = search.toLowerCase();

    return data
      .map((row, index) => ({ row, index }))
      .filter(({ row }) =>
        Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchValue),
        ),
      )
      .map(({ index }) => index);
  }, [data, search]);

  const getStatusClass = (type: QualityType) => {
    return `quality-badge ${type.toLowerCase()}`;
  };

  return (
    <div className="table-widget">
      {/* Header */}
      <div className="widget-header">
        <div>
          <h2>Smart Data Quality Table</h2>

          <p>
            Automatic data-quality and anomaly analysis
          </p>
        </div>

        <span className="analysis-badge">
          Smart Analysis
        </span>
      </div>

      {/* Quality Summary */}
      <div className="quality-summary">
        <div className="summary-card valid-card">
          <span className="summary-number">
            {qualitySummary.valid}
          </span>

          <span className="summary-label">
            Valid
          </span>
        </div>

        <div className="summary-card missing-card">
          <span className="summary-number">
            {qualitySummary.missing}
          </span>

          <span className="summary-label">
            Missing
          </span>
        </div>

        <div className="summary-card duplicate-card">
          <span className="summary-number">
            {qualitySummary.duplicate}
          </span>

          <span className="summary-label">
            Duplicate
          </span>
        </div>

        <div className="summary-card invalid-card">
          <span className="summary-number">
            {qualitySummary.invalid}
          </span>

          <span className="summary-label">
            Invalid
          </span>
        </div>

        <div className="summary-card anomaly-card">
          <span className="summary-number">
            {qualitySummary.anomaly}
          </span>

          <span className="summary-label">
            Anomaly
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        {search && (
          <button
            className="clear-button"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>

              {columns.map((column) => (
                <th key={column}>
                  {column.charAt(0).toUpperCase() +
                    column.slice(1)}
                </th>
              ))}

              <th>Data Quality</th>
            </tr>
          </thead>

          <tbody>
            {filteredIndexes.map((originalIndex) => {
              const row = data[originalIndex];

              const quality =
                qualityResults[originalIndex];

              return (
                <tr
                  key={originalIndex}
                  className={
                    selectedRow === originalIndex
                      ? "selected-row"
                      : ""
                  }
                  onClick={() =>
                    setSelectedRow(originalIndex)
                  }
                >
                  <td>{originalIndex + 1}</td>

                  {columns.map((column) => {
                    const value = row[column];

                    const isMissing =
                      value === null ||
                      value === undefined ||
                      String(value).trim() === "";

                    return (
                      <td
                        key={column}
                        className={
                          isMissing
                            ? "missing-cell"
                            : ""
                        }
                      >
                        {isMissing
                          ? "Missing"
                          : String(value)}
                      </td>
                    );
                  })}

                  <td>
                    <span
                      className={getStatusClass(
                        quality.type,
                      )}
                      title={quality.message}
                    >
                      {quality.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredIndexes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            📋
          </div>

          <h3>No records found</h3>

          <p>
            Try changing your search.
          </p>
        </div>
      )}

      {/* Selected Row Information */}
      {selectedRow !== null &&
        data[selectedRow] && (
          <div className="selected-info">
            <div>
              <strong>
                Selected Row:
              </strong>{" "}
              {selectedRow + 1}
            </div>

            <div>
              <strong>
                Quality:
              </strong>{" "}
              <span
                className={getStatusClass(
                  qualityResults[selectedRow]
                    .type,
                )}
              >
                {
                  qualityResults[selectedRow]
                    .type
                }
              </span>
            </div>

            <div className="quality-message">
              {
                qualityResults[selectedRow]
                  .message
              }
            </div>
          </div>
        )}

      {/* Footer */}
      <div className="widget-footer">
        <span>
          {filteredIndexes.length} of{" "}
          {data.length} records displayed
        </span>

        <span>
          Automatic quality analysis enabled
        </span>
      </div>
    </div>
  );
};

export default ImprovedTable;
