'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

export const MixerSwap: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left font-mono text-gray-400">Mixer Swap</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit()} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Amount</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input disabled={form.formState.isSubmitting} {...register('newMessage')} />
                    <Button
                      type="submit"
                      className="bg-primary font-bold"
                      disabled={fetchIsLoading || form.formState.isSubmitting}
                      isLoading={form.formState.isSubmitting}
                    >
                      Submit
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            </form>
          </CardContent>
        </Card>
      </Form>
    </div>
  )
}
