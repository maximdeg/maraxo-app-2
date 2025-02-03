"use client"

import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


import CustomSelectButton from "@/components/CustomSelectButton"
import AppointmentForm from '@/components/AppointmentForm';




export default function Home() {


  return (
    <section className='flex flex-col py-5 px-10 mx-10 items-center'>
      <div className='text-center mb-5'>
        <h1 className='text-6xl'>Mara Flamini</h1>
        <h2 className='text-3xl'>Consultorio dermatologico</h2>
      </div>
      <AppointmentForm/>
    </section>
  );
}
