interface FormFieldProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
  placeholder
}: FormFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
          focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 