import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface Option {
  id: string
  name: string
}

interface FilterSelectProps {
  label: string
  options: Option[]
  value: string
  onValueChange: (value: string) => void
}

export function FilterSelect({
  label,
  options,
  value,
  onValueChange,
}: FilterSelectProps) {
  return (
    <div className="bg-blue-900 rounded-xl mt-3 p-2 w-[230px] select-bg-white">
      <h2 className="uppercase font-bold text-xs text-gray-100">{label}</h2>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="text-gray-100 bg-blue-950 font-bold text-sm rounded-xl border-none">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent className="bg-white w-[210px] mt-2">
          <SelectItem
            className="bg-transparent hover:bg-gray-200"
            value="todos"
          >
            Todos
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              className="bg-transparent hover:bg-gray-200"
              key={option.id}
              value={option.id}
            >
              <span className="hover:bg-gray-200">{option.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
