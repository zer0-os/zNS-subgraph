import { BigInt } from "@graphprotocol/graph-ts"
import {
  Registrar,
  DomainCreated,
  Transfer,
  MetadataLocked,
  MetadataUnlocked,
  MetadataChanged,
  RoyaltiesAmountChanged
} from "../generated/Registrar/Registrar"
import { Account, Domain, DomainTransferred } from "../generated/schema"

// event DomainCreated(
//   uint256 indexed id,
//   string name,
//   uint256 indexed nameHash,
//   uint256 indexed parent,
//   address creator,
//   address controller
// );
export function handleDomainCreated(event: DomainCreated): void {
  let account = new Account(event.params.creator.toHex())
  account.save()

  let domain = Domain.load(event.params.id.toHex())
  let domainParent = Domain.load(event.params.parent.toHex())
   domain.owner = account.id
   domain.creator = account.id
   if(domainParent.name == null){
     domain.name = event.params.name
   } else {
     domain.name = domainParent.name + "." + event.params.name
   }
   domain.labelHash = event.params.nameHash.toHex()
   domain.parent = domainParent.id
   domain.blockNumber = event.block.number.toI32()
   domain.transactionID = event.transaction.hash

   domain.save()

}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.to.toHex())
  account.save()

  let domain = Domain.load(event.params.tokenId.toHex())
  if(domain == null) {
    domain = new Domain(event.params.tokenId.toHex())
    domain.isLocked = false
    domain.royaltyAmount = BigInt.fromI32(0)
    domain.events = []
  }
  domain.owner = account.id
  domain.save()

  let transferEvent = new DomainTransferred(event.transaction.hash.toHex())
  transferEvent.domain = event.params.tokenId.toHex()
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionID = event.transaction.hash
  transferEvent.save()
}

export function handleMetadataChanged(event: MetadataChanged): void {
  let domain = Domain.load(event.params.id.toHex())
  if(domain == null) {
     domain = new Domain(event.params.id.toHex())
  }
  domain.metadata = event.params.uri
  domain.save()
}

export function handleMetadataLocked(event: MetadataLocked): void {
  let account = new Account(event.params.locker.toHex())
  account.save()

  let domain = Domain.load(event.params.id.toHex())
  if(domain == null) {
     domain = new Domain(event.params.id.toHex())
  }
  domain.isLocked = true
  domain.lockedBy = account.id
  domain.save()
}

export function handleMetadataUnlocked(event: MetadataUnlocked): void {
  let domain = Domain.load(event.params.id.toHex())
  if(domain == null) {
     domain = new Domain(event.params.id.toHex())
  }
  domain.isLocked = false
  domain.lockedBy = null
  domain.save()
}

export function handleRoyaltiesAmountChanged(event: RoyaltiesAmountChanged): void {
  let domain = Domain.load(event.params.id.toHex())
  if(domain == null) {
     domain = new Domain(event.params.id.toHex())
  }
  domain.royaltyAmount = event.params.amount
  domain.save()
}
