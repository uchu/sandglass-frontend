'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { compactAddLength, hexToU8a, stringToU8a } from '@polkadot/util'
import { useInkathon } from '@scio-labs/use-inkathon'
import random from 'crypto-random-bigint'
import { MerkleTree } from 'fixed-merkle-tree'
import { poseidon2 } from "poseidon-bls12381"
import toast from 'react-hot-toast'
import { groth16 } from "snarkjs"
import vkey from './verification_key.json'

const formSchema = z.object({
  amount: z.string().min(1).max(90),
  faCode: z.string().min(1).max(90),
})

export const DepositCard: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit, formState: { errors } } = form
  const { api, activeAccount, activeSigner } = useInkathon()
  function toFixedHex(value: any, length = 32) {
    const isBuffer = value instanceof Buffer
  
    const str = isBuffer ? value.toString('hex') : BigInt(value).toString(16)
    return '0x' + str.padStart(length * 2, '0')
  }
// Update Greeting
const deposit: SubmitHandler<z.infer<typeof formSchema>> = async ({ amount, faCode }) => {
  console.log(amount, faCode)
  if (!activeAccount || !activeSigner || !api) {
    toast.error('Wallet not connected. Try again…')
    return
  }
  const a2vkey = stringToU8a(JSON.stringify(vkey));
  const compact_a2vkey = compactAddLength(a2vkey);

  const t = await api.tx.mixer
  .setupVerification(compact_a2vkey)
  .signAndSend(activeAccount.address);
  console.log(`Submitted with hash ${t}`);
  const sk2 = BigInt( random(64) ); //random number
  const cmt2 = poseidon2([sk2, BigInt(0)]);
  console.log("@@@hash: ", cmt2.toString(16),  cmt2.toString());
  console.log("@@@sk2: ", sk2);

  const a = hexToU8a("0x" + cmt2.toString(16));
  const compact_a = compactAddLength(a);

  const txHash = await api.tx.mixer
  .deposit(compact_a)
  .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
    if (status.isInBlock) {
      console.log(`Completed at block hash #${status.asInBlock.toString()}`)
    } else {
      console.log(`Current status: ${status.type}`)
    }
  })
  console.log(`Submitted with hash ${txHash}`);

  const hashFun = (left: any, right: any) => poseidon2([BigInt(left), BigInt(right)]).toString();

  const tree = new MerkleTree(8, undefined, {
    zeroElement: '0',
    hashFunction: hashFun
  });

  const merkleCommitmentsVec = (await api.query.mixer.merkleVec()).toJSON();
  const o = JSON.parse(JSON.stringify(merkleCommitmentsVec));

  for (const k in o) {
    console.log(k, o[k]);
    const cm = BigInt(o[k]);
    tree.bulkInsert([cm.toString()])
  }

  // product root
  const root = toFixedHex(tree.root)
  console.log("@@@ local root3", root, tree.root.toString());

  console.log("@@@ tree is ", tree);

  // product proof
  const commitment = cmt2.toString();
  const leafIndex = tree.indexOf(commitment);  
  console.log( "leafIndex", leafIndex);

  const nullifier = poseidon2([BigInt(leafIndex), sk2, ]);

  const { pathElements, pathIndices } = tree.path(leafIndex)

  const input = {
    root: tree.root.toString(),
    nullifierHash: nullifier.toString(),
    secret: sk2.toString(),
    paths2_root: pathElements,
    paths2_root_pos: pathIndices,
  };

  console.log("@@@input is, ",    JSON.stringify( input ) );

  const {proof, publicSignals} = await groth16.fullProve(input, "./mixer.wasm", "./mixer_0001.zkey")

  const a2nullifier = hexToU8a("0x" + nullifier.toString(16));
  const compact_a2nullifier = compactAddLength(a2nullifier);

  const a2root = hexToU8a(root);
  const compact_a2root = compactAddLength(a2root);

  console.log("@@@ proof is", JSON.stringify(proof));
}

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left text-primary font-sans font-bold text-2xl">Deposit</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(deposit)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Amount</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="number" disabled={form.formState.isSubmitting}  {...register('amount', { required: true })} />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">2fa code(Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input disabled={form.formState.isSubmitting} {...register('faCode')} />
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
                      Deposit
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
