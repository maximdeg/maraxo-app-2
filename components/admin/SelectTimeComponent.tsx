import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

const SelectTimeComponent = ({ placeholderText }: { placeholderText: string }) => {
    const times = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    return (
        <Select>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholderText} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Horarios disponibles</SelectLabel>
                    {times.map((time) => (
                        <SelectItem key={time} value={time}>
                            {time}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default SelectTimeComponent;
