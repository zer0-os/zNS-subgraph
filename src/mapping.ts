import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  Approval,
  ApprovalForAll,
  RegistryCreated,
  Transfer
} from "../generated/Contract/Contract"
import { NewRegistry, TransferToken } from "../generated/schema"

export function handleRegistryCreated(event: RegistryCreated):void {
  let registry = new NewRegistry(event.params.domain)
  registry.parentID = event.params.parentId
  registry.domain = event.params.domain
  registry.owner = event.params._owner
  registry.controller = event.params._controller
  registry.ref = event.params._ref
  registry.block = event.block.number
  registry.timestamp = event.block.timestamp
  registry.save()
}

// export function handleApproval(event: Approval): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = Registry.load(event.transaction.from.toHex())

//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (entity == null) {
//     entity = new Registry(event.transaction.from.toHex())

//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0)
//   }

//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1)

//   // Entity fields can be set based on event parameters
//   entity.owner = event.params.owner
//   entity.approved = event.params.approved

//   // Entities can be written to the store with `.save()`
//   entity.save()

//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.

//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract.balanceOf(...)
//   // - contract.baseURI(...)
//   // - contract.entries(...)
//   // - contract.getApproved(...)
//   // - contract.getId(...)
//   // - contract.getOwner(...)
//   // - contract.isApprovedForAll(...)
//   // - contract.name(...)
//   // - contract.ownerOf(...)
//   // - contract.supportsInterface(...)
//   // - contract.symbol(...)
//   // - contract.tokenByIndex(...)
//   // - contract.tokenOfOwnerByIndex(...)
//   // - contract.tokenURI(...)
//   // - contract.totalSupply(...)
// }

export function handleApproval(event: Approval):void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransfer(event: Transfer): void {
  let txhash = event.transaction.hash.toHexString()
  let transfer = new TransferToken(txhash)
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.tokenId = event.params.tokenId
  transfer.block = event.block.number
  transfer.timestamp = event.block.timestamp
  transfer.save()
}
