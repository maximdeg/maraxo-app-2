import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

const SelectTimeComponent = ({
    placeholderText,
    isDisabled,
    onChange,
}: {
    placeholderText: string;
    isDisabled: boolean;
    onChange: (value: string) => void;
}) => {
    const times = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    const [value, setValue] = React.useState("");

    const handleChange = (value: string) => {
        setValue(value);
        onChange(value);
    };

    return (
        <Select disabled={isDisabled} value={value} onValueChange={handleChange}>
            <SelectTrigger className={isDisabled ? "w-full border-gray-700" : "w-full"}>
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
