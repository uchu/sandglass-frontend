'use client'

import Image from 'next/image'
import { FC, useEffect, useState } from 'react'

import { compactAddLength, hexToU8a } from '@polkadot/util'
import { useInkathon } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { generateMerkleTree } from '@/utils/2fa'

export const FaCard: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()

  const [image, setImage] = useState('')
  const [secret, setSecret] = useState('')
  const [validCode, setValidCode] = useState('')
  const [isCodeValid, setIsCodeValid] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [uri, setURI] = useState('')

  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [Deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(true)

  const deploy = async (event: any) => {
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    event.preventDefault()
    setError(false)
    setDeployed(false)

    setDeploying(true)

    const [_uri, _secret, root] = await generateMerkleTree()

    setSecret(_secret)
    setURI(_uri)

    const root_u8a = hexToU8a('0x' + root.toString(16))
    const compact_root = compactAddLength(root_u8a)

    //console.log('@@@ root is', root, JSON.stringify(compact_root))
    await api?.tx.otp
      .setOtpCommitment(compact_root)
      .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
        if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`)
        } else {
          console.log(`Current status: ${status.type}`)
        }
      })
      .catch((error: any) => {
        setErrorMsg(error.toString())
        setError(true)
        setDeploying(false)
        console.log(':( transaction failed', error)
      })

    setDeploying(false)
    setDeployed(true)
    event.preventDefault()
  }

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const [_uri, _secret, root] = await generateMerkleTree()

      setSecret(_secret)
      setURI(_uri)
    }

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error)
  }, [])

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-left font-sans text-2xl font-bold text-primary">2FA</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={deploy}>New 2fa key</Button>
          <div className="py-4 text-xl text-primary">
            Scan the QR code using Google Authenticator or manually input the setup key
          </div>
          <div className="py-4 text-xl">Setup key: {secret}</div>
          <div>
            <Image src={uri} width={240} height={240} alt="QR Code" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
