"use client"

import AppointmentForm from '@/components/AppointmentForm';

export default function Home() {

  return (
    <section className='flex flex-col py-5 px-10 mx-10 items-center'>
      <div className='text-center mb-5'>
        <h1 className='text-4xl lg:text-6xl '>Mara Flamini</h1>
        <h2 className='lg:text-3xl text-md'>Consultorio dermatologico</h2>
      </div>
      <AppointmentForm/>
    </section>
  );
}
