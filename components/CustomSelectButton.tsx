import React from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "./ui/select"

const CustomSelectButton = () => {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccione su visita" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel>Visita</SelectLabel> */}
          <SelectItem value="apple">Consulta</SelectItem>
          <SelectItem value="banana">Practica</SelectItem>
          <SelectItem value="blueberry">Peeling</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default CustomSelectButton
