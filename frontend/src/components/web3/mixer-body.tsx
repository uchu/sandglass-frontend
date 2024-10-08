'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import
  {
    useInkathon
  } from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

export const MixerBody: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form
 

  if (!api) return null

  return (
    <>
      <Tabs.Root defaultValue="tab1" orientation="vertical">
        <Tabs.List className="px-4" aria-label="tabs example">
          <Tabs.Trigger className="p-4 mr-8" value="tab1">Deposit</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Withdraw</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <div className="flex max-w-[22rem] grow flex-col gap-4">
            <h2 className="text-center font-mono text-gray-400">Deposit</h2>

            <Form {...form}>
              <Card>
                <CardContent className="pt-6">
                  <form
                    onSubmit={handleSubmit()}
                    className="flex flex-col justify-end gap-2"
                  >
                    <FormItem>
                      <FormLabel className="text-base">Amount</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            disabled={form.formState.isSubmitting}
                            {...register('newMessage')}
                          />
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
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <div className="flex max-w-[22rem] grow flex-col gap-4">
            <h2 className="text-center font-mono text-gray-400">Withdraw</h2>

            <Form {...form}>
              <Card>
                <CardContent className="pt-6">
                  <form
                    onSubmit={handleSubmit()}
                    className="flex flex-col justify-end gap-2"
                  >
                    <FormItem>
                      <FormLabel className="text-base">Amount</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            disabled={form.formState.isSubmitting}
                            {...register('newMessage')}
                          />
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
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}
