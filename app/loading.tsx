import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"


const loading = () => {
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  )
}

export default loading
