import { useEffect, useState } from 'react'

import { ApiPromise } from '@polkadot/api'
import { useInkathon } from '@scio-labs/use-inkathon'

export type OrderData = {
  orderId: string
  baseCurrencyId: string
  baseAmount: number
  targetCurrencyId: string
  targetAmount: number
}

export const parseOrderData = async (api: ApiPromise, data?: any): Promise<OrderData[]> => {
  // Query the chain and parse data

  const orders: OrderData[] = []
  data.forEach((item: any) => {
    console.log(`${item[0]}:  value ${item[1].toHuman()}`)

    orders.push({
      orderId: item[0].toString(),
      baseCurrencyId: item[1].baseCurrencyId,
      baseAmount: item[1].baseAmount,
      targetCurrencyId: item[1].targetCurrencyId,
      targetAmount: item[1].targetAmount,
    })
  })

  return orders
}

export const getOrder = async (api: ApiPromise): Promise<OrderData[]> => {
  // Query the chain and parse data
  const allEntries: any = await api.query.swap.orders.entries()

  const orders: OrderData[] = []
  allEntries.forEach((item: any) => {
    const o = item[1].toHuman()
    console.log(`${item[0]}:  value ${o}`)

    orders.push({
      orderId: item[0].toHuman(),
      baseCurrencyId: JSON.stringify(o.baseCurrencyId),
      baseAmount: o.baseAmount,
      targetCurrencyId: JSON.stringify(o.targetCurrencyId),
      targetAmount: o.targetAmount,
    })
  })

  console.log(`orders:  ${JSON.stringify(orders)}`)
  return orders
}

/**
 * Hook that returns the native token order of the given `address`.
 */
export const useOrder = (watch?: boolean): any => {
  const { api } = useInkathon()
  const [orderData, setOrderData] = useState<OrderData[]>([])
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateOrderData = (data: OrderData[]) => {
      setOrderData(() => data)
    }

    if (!api) {
      updateOrderData({} as OrderData[])
      return
    }

    getOrder(api).then(updateOrderData)
  }, [api])

  return orderData
}
