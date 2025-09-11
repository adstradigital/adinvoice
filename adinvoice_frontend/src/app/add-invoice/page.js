"use client";

// this is mishal branch
import { useState } from "react";
import { useRouter } from "next/navigation";
// import Button from "../../components/Button";

export default function AddInvoice() {
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("New Invoice:", { clientName, amount, status });
    alert("Invoice added (check console)");

    router.push("/");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded max-w-md">
        <div>
          <label className="block mb-1 font-medium">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </div>
        <Button text="Add Invoice" />
      </form>
    </div>
  );
}
