"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import DataForm from './data-form'

export default function CreatePembelian() {
  return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create OP</CardTitle>
          <CardDescription>Order Pembelian Form</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <DataForm />
        </CardContent>
      </Card>
    </main>
  )
}
