"use client";

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestTimeSelectionPage() {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAvailableTimes = async (date: Date) => {
        setLoading(true);
        try {
            const formatedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                .split("-")
                .map((item) => (item.length < 2 ? `0${item}` : item))
                .join("-");

            const response = await fetch(`/api/available-times/${formatedDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch available times');
            }
            const data = await response.json();

            // Generate times based on available slots
            if (data.availableSlots && data.availableSlots.start_time && data.availableSlots.end_time) {
                const startTime = data.availableSlots.start_time;
                const endTime = data.availableSlots.end_time;
                
                const startHour = parseInt(startTime.split(":")[0]);
                const startMinutes = parseInt(startTime.split(":")[1]);
                const endHour = parseInt(endTime.split(":")[0]);
                const endMinutes = parseInt(endTime.split(":")[1]);

                const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
                const intervalMinutes = 20;

                const times: string[] = [];
                for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
                    const hour = startHour + Math.floor(i / 60);
                    const minutes = (i % 60).toString().padStart(2, "0");
                    const time = `${hour}:${minutes}`;
                    times.push(time);
                }
                
                setAvailableTimes(times);
            } else {
                setAvailableTimes([]);
            }
        } catch (error) {
            console.error('Error fetching available times:', error);
            setAvailableTimes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedTime('');
        if (date) {
            fetchAvailableTimes(date);
        } else {
            setAvailableTimes([]);
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select both date and time');
            return;
        }

        try {
            const response = await fetch('/api/appointments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: 'Test',
                    last_name: 'User',
                    phone_number: '+1234567890',
                    visit_type_id: 1,
                    consult_type_id: 1,
                    appointment_date: selectedDate.toISOString().split('T')[0],
                    appointment_time: selectedTime,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Appointment created successfully! ID: ${result.appointment_info.id}`);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Error creating appointment');
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Test Time Selection</CardTitle>
                    <CardDescription>
                        Test the time selection functionality after fixing server action errors
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Select Date</h3>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                        />
                    </div>

                    {selectedDate && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Select Time</h3>
                            <Select value={selectedTime} onValueChange={handleTimeSelect}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={loading ? "Loading..." : "Select a time"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTimes.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedDate && selectedTime && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <h4 className="font-semibold text-green-800">Selected:</h4>
                            <p className="text-green-700">
                                Date: {selectedDate.toLocaleDateString()}
                            </p>
                            <p className="text-green-700">
                                Time: {selectedTime}
                            </p>
                        </div>
                    )}

                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedDate || !selectedTime}
                        className="w-full"
                    >
                        Test Create Appointment
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

