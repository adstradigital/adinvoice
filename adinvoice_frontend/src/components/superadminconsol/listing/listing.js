"use client";

const companies = [
  { id: 1, name: "Tech Solutions", users: 120, revenue: "$12,000" },
  { id: 2, name: "Green Energy", users: 85, revenue: "$8,500" },
  { id: 3, name: "Blue Media", users: 45, revenue: "$4,200" },
];

export default function CompaniesList() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🏢 Companies List</h1>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-indigo-700 text-white">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Company Name</th>
              <th className="px-6 py-3 text-left">Users</th>
              <th className="px-6 py-3 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b hover:bg-gray-100">
                <td className="px-6 py-3">{company.id}</td>
                <td className="px-6 py-3">{company.name}</td>
                <td className="px-6 py-3">{company.users}</td>
                <td className="px-6 py-3">{company.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
