import React from 'react';

export default function Input({ label, value, className, type = 'number', step = 0.1 }) {
  const [val, setVal] = value;
  const handleChange = (e) => setVal(parseFloat(e.target.value));

  return (
    <div className={className}>
      <label className="block mt-4 text-xs text-gray-600 whitespace-no-wrap">{label}</label>
      <input
        className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-md py-2 px-4 text-sm block w-full appearance-none leading-normal"
        type={type}
        value={val}
        onChange={handleChange}
      />
    </div>
  );
}
