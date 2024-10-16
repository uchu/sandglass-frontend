'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useOrder } from '@/hooks/useOrder'

const formSchema = z.object({
  note: z.string().min(1).max(90),
  address: z.string().min(1).max(90),
  orderId: z.string(),
})

export const MixerSwap: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const orders = useOrder(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form
  const withdraw: SubmitHandler<z.infer<typeof formSchema>> = async ({ note, address }) => {
    console.log(note, address)
    console.log('@@orders', orders)
  }

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left font-sans text-2xl font-bold text-primary">Mixer Swap</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(withdraw)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Note</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      disabled={form.formState.isSubmitting}
                      {...register('note', { required: true })}
                    />
                  </div>
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-base">recipient address</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      disabled={form.formState.isSubmitting}
                      {...register('address', { required: true })}
                    />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">order id</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      disabled={form.formState.isSubmitting}
                      {...register('orderId', { required: true })}
                    />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormControl>
                  <div className="flex justify-center p-4">
                    <Button
                      type="submit"
                      className="bg-primary font-bold"
                      disabled={fetchIsLoading || form.formState.isSubmitting}
                      isLoading={form.formState.isSubmitting}
                    >
                      swap
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            </form>

            <div>
              <table style={{ width: 500 }}>
                <tbody>
                  {orders.map((item: any) => {
                    return (
                      <tr key={item.orderId}>
                        <td>{item.orderId}</td>
                        <td>{item.baseCurrencyId}</td>
                        <td>{item.baseAmount}</td>
                        <td>{item.targetCurrencyId}</td>
                        <td>{item.targetAmount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  )
}
