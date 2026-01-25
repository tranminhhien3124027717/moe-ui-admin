export const listAccColumn = [
  { title: "Name ↑↓", dataIndex: "fullName", key: "name" },
  {
    title: "NRIC",
    dataIndex: "nric",
    key: "nric",
    render: (text) => <span>{text}</span>,
  },
  { title: "Age ↑↓", dataIndex: "age", key: "age" },
  {
    title: "Balance ↑↓",
    dataIndex: "balance",
    key: "balance",
    render: (val) => <span>S${val.toLocaleString()}</span>,
  },
  { title: "Education ↑↓", dataIndex: "educationLevel", key: "education" },
  {
    title: "Residential Status",
    dataIndex: "residentialStatus",
    key: "status",
  },
  {
    title: "Created ↑↓",
    key: "created",
    align: "center",
    render: (_, record) => (
      <div style={{ textAlign: "center", lineHeight: 1.4 }}>
        <div style={{ fontWeight: 500 }}>{record.createdDate}</div>
        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
          {record.createTime}
        </div>
      </div>
    ),
  },
  {
    title: "Courses",
    dataIndex: "courseCount",
    key: "courses",
    render: (count) => <span>📖 {count}</span>,
  },
];
