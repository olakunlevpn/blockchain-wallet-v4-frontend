import * as StellarSdk from 'stellar-sdk'
import moment from 'moment'
import {
  compose,
  contains,
  curry,
  defaultTo,
  find,
  map,
  prop,
  propEq
} from 'ramda'
import BigNumber from 'bignumber.js'

const getType = (tx, addresses) => {
  if (contains(tx.from, addresses) && contains(tx.to, addresses))
    return 'transferred'
  if (contains(tx.from, addresses)) return 'sent'
  if (contains(tx.to, addresses)) return 'received'
  return 'unknown'
}

const getAmount = operation => {
  if (operation.amount) return operation.amount().toString()
  if (operation.startingBalance) return operation.startingBalance().toString()
  return '0'
}
export const getDestination = operation =>
  StellarSdk.StrKey.encodeEd25519PublicKey(operation.destination().value())

const getLabel = (accounts, address) =>
  compose(
    defaultTo(address),
    prop('label'),
    find(propEq('publicKey', address))
  )(accounts)

export const transformTx = curry((accounts, tx, txNotes, operation) => {
  const addresses = map(prop('publicKey'), accounts)
  const operationAmount = getAmount(operation)
  const to = getDestination(operation)
  const from = prop('source_account', tx)
  const type = getType({ to, from }, addresses)
  const fee = prop('fee_paid', tx)
  const time = moment(prop('created_at', tx)).format('X')
  const hash = prop('hash', tx)
  const memo = prop('memo', tx)
  const memoType = prop('memo_type', tx)
  const amount =
    type === 'sent'
      ? new BigNumber(operationAmount).add(fee).toString()
      : operationAmount

  return {
    amount,
    confirmations: 1,
    description: prop(hash, txNotes),
    fee,
    from: getLabel(accounts, from),
    hash,
    memo,
    memoType,
    time,
    to: getLabel(accounts, to),
    type
  }
})

export const decodeOperations = tx =>
  map(
    operation => operation.body().value(),
    StellarSdk.xdr.TransactionEnvelope.fromXDR(tx.envelope_xdr, 'base64')
      .tx()
      .operations()
  )
