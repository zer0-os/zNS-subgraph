import { BigInt } from "@graphprotocol/graph-ts"
import {
  Registrar,
  Approval,
  ApprovalForAll,
  ControllerAdded,
  ControllerRemoved,
  DomainCreated,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused
} from "../generated/Registrar/Registrar"
import { Account, Domain, TransferEntity} from "../generated/schema"

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
   if(domain == null) {
      domain = new Domain(event.params.id.toHex())
   }
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
   domain.transactionId = event.transaction.hash
   domain.save()

}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.to.toHex())
  account.save()

  let domain = Domain.load(event.params.tokenId.toHex())
  if(domain == null) {
    domain = new Domain(event.params.tokenId.toHex())
  }
  domain.owner = account.id
  domain.save()

  let transferEvent = new TransferEntity(event.transaction.hash.toHex())
  transferEvent.domain = event.params.tokenId.toHex()
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionId = event.transaction.hash
  transferEvent.save()

}
